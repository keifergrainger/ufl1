import * as React from "react"
import { X } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const ToastProvider = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
}

const ToastViewport = React.forwardRef<
    HTMLOListElement,
    React.HTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
    <ol
        ref={ref}
        className={cn(
            "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
            className
        )}
        {...props}
    />
))
ToastViewport.displayName = "ToastViewport"

const toastVariants = cva(
    "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
    {
        variants: {
            variant: {
                default: "border bg-background text-foreground",
                destructive:
                    "destructive group border-destructive bg-destructive text-destructive-foreground",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

const Toast = React.forwardRef<
    HTMLLIElement,
    React.HTMLAttributes<HTMLLIElement> &
    VariantProps<typeof toastVariants> & {
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
    }
>(({ className, variant, open, onOpenChange, ...props }, ref) => {

    // Hand-rolled auto-dismiss since we removed Radix
    React.useEffect(() => {
        // If it's open, start a timer to close it
        // The default Radix duration is 5000ms usually
        const timer = setTimeout(() => {
            if (onOpenChange) onOpenChange(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, [onOpenChange]);

    if (open === false) return null;

    return (
        <li
            ref={ref}
            className={cn(toastVariants({ variant }), className)}
            data-state={open ? "open" : "closed"}
            {...props}
        />
    )
})
Toast.displayName = "Toast"

const ToastAction = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
    <button
        ref={ref}
        className={cn(
            "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
            className
        )}
        {...props}
    />
))
ToastAction.displayName = "ToastAction"

const ToastClose = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
    // We need to access the `onOpenChange` from context?
    // Radix does this via context. We are barebones.
    // The `Toaster` component passes props to `Toast`.
    // To make `ToastClose` work seamlessly without context, we might need a workaround.
    // OR, we assume `Toaster` doesn't strictly use `ToastClose` functionality that relies on context?
    // Wait, `Toaster.tsx` renders `<ToastClose />` inside `<Toast>`.
    // So `ToastClose` needs to trigger the close.
    // Since we don't have a Context, `ToastClose` button won't do anything unless we attach an onClick handler in `Toaster`.
    // BUT `Toaster.tsx` is:
    /*
      <Toast key={id} {...props}>
        <div className="grid gap-1">...</div>
        {action}
        <ToastClose />
      </Toast>
    */
    // `ToastClose` is a child.
    // I will make `ToastClose` just a button.
    // But who handles the click?
    // In `radix`, the primitive handles it.
    // I will add a Context for the Toast.
    return (
        <ToastCloseButton {...props} />
    )
})
ToastClose.displayName = "ToastClose"

// Helper context for our custom implementation
const ToastContext = React.createContext<{ onClose: () => void } | null>(null);

// We need to wrap Toast content in a context provider.
// I'll rewrite the exported `Toast` to include the provider.
const ToastInner = React.forwardRef<
    HTMLLIElement,
    React.HTMLAttributes<HTMLLIElement> &
    VariantProps<typeof toastVariants> & {
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
    }
>(({ className, variant, open, onOpenChange, children, ...props }, ref) => {

    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (onOpenChange) onOpenChange(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, [onOpenChange]);

    const handleClose = () => {
        if (onOpenChange) onOpenChange(false);
    }

    if (open === false) return null;

    return (
        <ToastContext.Provider value={{ onClose: handleClose }}>
            <li
                ref={ref}
                className={cn(toastVariants({ variant }), className)}
                data-state={open ? "open" : "closed"}
                {...props}
            >
                {children}
            </li>
        </ToastContext.Provider>
    )
})
ToastInner.displayName = "Toast"

// The Close Button that consumes the context
const ToastCloseButton = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
    const context = React.useContext(ToastContext);

    return (
        <button
            ref={ref}
            className={cn(
                "absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
                className
            )}
            onClick={(e) => {
                if (onClick) onClick(e);
                context?.onClose();
            }}
            {...props}
        >
            <X className="h-4 w-4" />
        </button>
    )
})
ToastCloseButton.displayName = "ToastCloseButton"


const ToastTitle = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("text-sm font-semibold [&+div]:text-xs", className)}
        {...props}
    />
))
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("text-sm opacity-90", className)}
        {...props}
    />
))
ToastDescription.displayName = "ToastDescription"

type ToastProps = React.ComponentPropsWithoutRef<typeof ToastInner>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
    type ToastProps,
    type ToastActionElement,
    ToastProvider,
    ToastViewport,
    ToastInner as Toast,
    ToastTitle,
    ToastDescription,
    ToastClose, // This is now our wrapper capable of closing
    ToastAction,
}
