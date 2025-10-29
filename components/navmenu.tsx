import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Separator } from "./ui/separator";

export async function NavMenu() {
  return (
    <div className="flex w-full items-center justify-center lg:justify-between px-1 lg:px-40 space-x-8 pt-2">
      {/* Logo principal */}
      <Link href="/">
        <div className="flex flex-row items-center gap-2 cursor-pointer">
          <Image
            src="/tec-logo.webp"
            alt="Logo Tec"
            width={200}
            height={50}
            className="w-24 h-auto"
          />
          <Separator orientation="vertical" className="h-6 bg-black" />
          <Image
            src="/servicio-logo.webp"
            alt="Logo Servicio"
            width={200}
            height={50}
            className="w-20 h-auto"
          />
        </div>
      </Link>

      {/* Menú de navegación */}
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/catalogo" className={navigationMenuTriggerStyle()}>
                Catalogo
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/favoritos" className={navigationMenuTriggerStyle()}>
                Favoritos
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md px-2 py-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
