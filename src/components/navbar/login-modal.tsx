import React from "react";

import { Button } from "../ui/button";

import { User } from "lucide-react";


export default function LoginModal() {
  return (
    // <Dialog>
    //   <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:opacity-80" style={{ color: 'var(--pure-white)' }}
        >
          <User className="h-8 w-8 stroke-[2.5px]" style={{ color: 'var(--pure-white)' }} />
          <span className="sr-only">Account</span>
        </Button>
    //   </DialogTrigger>
    //   <DialogContent className="  rounded-none md:min-w-[700px] md:p-10">
    //     <DialogHeader>
    //       <DialogTitle className="md:text-3xl">Log in</DialogTitle>
    //       <DialogDescription className=" hidden"></DialogDescription>

    //       <div className="grid gap-4 py-4">
    //         <div className="grid gap-2">
    //           <label htmlFor="email">Email *</label>
    //           <Input
    //             id="email"
    //             type="email"
    //             required
    //             className="w-full"
    //             placeholder="Enter your email"
    //           />
    //         </div>
    //         <div className="grid gap-2">
    //           <Label htmlFor="password">Password *</Label>
    //           <Input
    //             id="password"
    //             type="password"
    //             required
    //             className="w-full"
    //             placeholder="Enter your password"
    //           />
    //         </div>
    //       </div>
    //       <div>
    //         <Button
    //           variant="link"
    //           className="px-0 items-start text-sm font-normal"
    //           onClick={() => {
    //             // Handle forgot password
    //           }}
    //         >
    //           Forgot your password?
    //         </Button>
    //       </div>
    //       <div className="flex justify-between">
    //         <Button
    //           className=" w-full rounded-none text-sm py-3"
    //           onClick={() => {
    //             // Handle forgot password
    //           }}
    //         >
    //           Forgot your password?
    //         </Button>
    //         <Button
    //           variant="link"
    //           className=" text-sm"
    //           onClick={() => {
    //             // Handle forgot password
    //           }}
    //         >
    //           New customer? Create your account
    //         </Button>
    //       </div>
    //     </DialogHeader>
    //   </DialogContent>
    // </Dialog>
  );
}