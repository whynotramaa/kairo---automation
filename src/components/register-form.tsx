"use client"

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { GithubLogo, GoogleLogo } from "@phosphor-icons/react";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import z, { email } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const RegisterSchema = z.object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(6, "Password of atleast length 6 is required"),
    confirmPassword: z.string(),
}).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: "custom",
            message: "Passwords don't match",
            path: ["confirmPassword"]
        });
        ctx.addIssue({
            code: "custom",
            message: "Passwords don't match",
            path: ["password"]
        });
    }
});

type RegisterFormValues = z.infer<typeof RegisterSchema>;

export function RegisterForm() {
    const router = useRouter()

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        }
    })

    const onSubmit = async (values: RegisterFormValues) => {
        console.log(values)
        await authClient.signUp.email(
            {
                name: values.email,
                email: values.email,
                password: values.password,
                callbackURL: '/'

            }, {
            onSuccess: () => {
                router.push("/")
            },
            onError: (ctx) => {
                toast.error(ctx.error.message)
            }
        })
    }

    const isPending = form.formState.isSubmitting

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>
                        Get Started
                    </CardTitle>
                    <CardDescription>
                        Create your account to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid gap-6">
                                {/* <div className="flex flex-col gap-4">
                                    <Button variant={"outline"} className="w-full" type="button" disabled={isPending}>
                                        <GithubLogo size={32} />
                                        Continue with GitHub
                                    </Button>
                                    <Button variant={"outline"} className="w-full" type="button" disabled={isPending}>
                                        <GoogleLogo size={32} />
                                        Continue with Google
                                    </Button>
                                </div> */}
                                <div className="grid gap-6">
                                    <FormField control={form.control} name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Email
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="example@email.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <FormField control={form.control} name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Password
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="******" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    <FormField control={form.control} name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Confirm your Password
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="******" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                    <Button type="submit" className="w-full" disabled={isPending}>
                                        {isPending ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : ("Create an account")}

                                    </Button>

                                    <div className="text-center text-sm">
                                        Alredy have an account ? {" "}
                                        <Link href="/login" className="underline underline-offset-4">
                                            Log in
                                        </Link>
                                    </div>

                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )

}