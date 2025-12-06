import * as React from "react";
import { useMediaQuery } from "@app/hooks/use-media-query";
import { Button } from "@app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@app/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@app/components/ui/drawer";

interface ResponsiveDialogProps {
  children: React.ReactNode;
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showFooter?: boolean;
  cancelText?: string;
  onCancel?: () => void;
  maxWidth?: string;
  minWidth?: string;
}

export function ResponsiveDialog({
  children,
  trigger,
  title,
  description,
  open,
  onOpenChange,
  showFooter = false,
  cancelText = "Cancel",
  onCancel,
  maxWidth = "sm:max-w-[425px]",
  minWidth = "sm:min-w-[300px]",
}: ResponsiveDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const openState = open !== undefined ? open : isOpen;
  const setOpenState = onOpenChange || setIsOpen;

  if (isDesktop) {
    return (
      <Dialog open={openState} onOpenChange={setOpenState}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className={maxWidth + " " + minWidth}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer
      open={openState}
      onOpenChange={setOpenState}
      modal={true}
      repositionInputs={false}
    >
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className="max-h-[90dvh] pb-2 fixed bottom-0 left-0 right-0  flex flex-col">
        <DrawerHeader className="text-left">
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className="px-4 overflow-y-auto flex-1">{children}</div>
        {showFooter && (
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline" onClick={onCancel}>
                {cancelText}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
