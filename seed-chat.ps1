$ErrorActionPreference = "Stop"

$ProjectId = "nadu-chatgpt"
$AuthEmulator = "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1"
$FunctionsBase = "http://127.0.0.1:5001/$ProjectId/us-central1"

# Emulator accepts any API key value
$ApiKey = "fake-api-key"

function Invoke-JsonPost($Url, $Body, $Headers = @{}) {
  return Invoke-RestMethod -Method POST -Uri $Url -Headers $Headers -ContentType "application/json" -Body ($Body | ConvertTo-Json -Depth 10)
}

function Ensure-SignIn($Email, $Password) {
  # Try signUp (may fail with EMAIL_EXISTS), then signInWithPassword
  try {
    $signUpUrl = "$AuthEmulator/accounts:signUp?key=$ApiKey"
    $r = Invoke-JsonPost $signUpUrl @{ email=$Email; password=$Password; returnSecureToken=$true }
    return @{ email=$Email; uid=$r.localId; idToken=$r.idToken; mode="created" }
  } catch {
    # if exists, sign in
    $signInUrl = "$AuthEmulator/accounts:signInWithPassword?key=$ApiKey"
    $r2 = Invoke-JsonPost $signInUrl @{ email=$Email; password=$Password; returnSecureToken=$true }
    return @{ email=$Email; uid=$r2.localId; idToken=$r2.idToken; mode="signed_in" }
  }
}

Write-Host "Signing in users..."
$userA = Ensure-SignIn "userA@test.local" "Password123!"
$userB = Ensure-SignIn "userB@test.local" "Password123!"

Write-Host "✅ UserA: $($userA.email) uid=$($userA.uid) ($($userA.mode))"
Write-Host "✅ UserB: $($userB.email) uid=$($userB.uid) ($($userB.mode))"
Write-Host ""

Write-Host "Creating chat (dm) with both members..."
$createUrl = "$FunctionsBase/createChat"
$headersA = @{ Authorization = "Bearer $($userA.idToken)" }

try {
  $createResp = Invoke-JsonPost $createUrl @{ type="dm"; memberUids=@($userA.uid, $userB.uid) } $headersA
  if (-not $createResp.ok) { throw ($createResp | ConvertTo-Json -Depth 10) }
  $chatId = $createResp.chatId
  Write-Host "✅ Chat created: chatId=$chatId"
} catch {
  Write-Host "❌ Function call failed: createChat"
  Write-Host "Details:"
  Write-Host $_.Exception.Message
  throw
}

Write-Host ""
Write-Host "Sending messages..."
$sendUrl = "$FunctionsBase/sendMessage"

$send1 = Invoke-JsonPost $sendUrl @{ chatId=$chatId; text="Hello from A" } $headersA
Write-Host "✅ A sent messageId=$($send1.messageId)"

$headersB = @{ Authorization = "Bearer $($userB.idToken)" }
$send2 = Invoke-JsonPost $sendUrl @{ chatId=$chatId; text="Hello from B" } $headersB
Write-Host "✅ B sent messageId=$($send2.messageId)"

Write-Host ""
Write-Host "DONE ✅ Now open Emulator UI -> Firestore -> chats/$chatId"
