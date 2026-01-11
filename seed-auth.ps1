# seed-auth.ps1
# Creates 2 users in Firebase Auth Emulator (Email/Password)
# Requires: emulators running with auth on 127.0.0.1:9099

$ErrorActionPreference = "Stop"

$authHost = "http://127.0.0.1:9099"
$projectId = "nadu-chatgpt"   # must match your emulator project id
$signUpUrl = "$authHost/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key"

$users = @(
  @{ email = "userA@test.local"; password = "Passw0rd!A"; displayName = "User A" },
  @{ email = "userB@test.local"; password = "Passw0rd!B"; displayName = "User B" }
)

function Create-User($u) {
  $body = @{
    email = $u.email
    password = $u.password
    returnSecureToken = $true
  } | ConvertTo-Json

  try {
    $res = Invoke-RestMethod -Method POST -Uri $signUpUrl -ContentType "application/json" -Body $body
    Write-Host "✅ Created:" $u.email "uid=" $res.localId
    return $res.localId
  }
  catch {
    $msg = $_.Exception.Message
    # If user already exists, emulator returns EMAIL_EXISTS
    if ($msg -match "EMAIL_EXISTS") {
      Write-Host "ℹ️ Already exists:" $u.email
      return $null
    }
    throw
  }
}

Write-Host "Seeding Auth Emulator users into project '$projectId'..."

foreach ($u in $users) {
  Create-User $u | Out-Null
}

Write-Host "Done. Open Emulator UI -> Auth: http://127.0.0.1:4000/auth"
