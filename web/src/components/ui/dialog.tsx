"use client"

import * as React from "react"

const DialogContext = React.createContext<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>({ open: false, onOpenChange: () => {} });

export const Dialog = ({ children, open, onOpenChange }: any) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : isOpen;
  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) setIsOpen(newOpen);
    if (onOpenChange) onOpenChange(newOpen);
  };

  return (
    <DialogContext.Provider value={{ open: currentOpen, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

export const DialogTrigger = ({ children, asChild, ...props }: any) => {
  const { onOpenChange } = React.useContext(DialogContext);
  return (
    <div onClick={() => onOpenChange(true)} {...props} className="cursor-pointer">
      {children}
    </div>
  );
};

export const DialogContent = ({ children, className }: any) => {
  const { open, onOpenChange } = React.useContext(DialogContext);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0 z-0" onClick={() => onOpenChange(false)} />

      <div className={`z-10 bg-gray-900 border border-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in duration-200 ${className}`}>
        {children}
      </div>
    </div>
  );
};

export const DialogHeader = ({ className, ...props }: any) => (
  <div className={`flex flex-col space-y-1.5 text-center sm:text-left mb-4 ${className}`} {...props} />
)

export const DialogFooter = ({ className, ...props }: any) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4 ${className}`} {...props} />
)

export const DialogTitle = ({ className, ...props }: any) => (
  <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props} />
)

export const DialogDescription = ({ className, ...props }: any) => (
  <p className={`text-sm text-gray-400 ${className}`} {...props} />
)
