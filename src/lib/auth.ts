import { polar, checkout, portal } from "@polar-sh/better-auth";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from "@/generated/prisma";
import { polarClient } from "./polar";

const prisma = new PrismaClient();
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: "a68655dd-64c2-4580-8c34-5cb0e08632c2",
                            slug: "Kairo-Pro" // Custom slug for easy reference in Checkout URL, e.g. /checkout/Kairo-Pro
                        }
                    ],
                    successUrl: process.env.POLAR_SUCCESS_URL!,
                    authenticatedUsersOnly: true
                }),
                portal(),
            ],
        })
    ]
});

