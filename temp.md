
const loginSchema = z.object({
    email: z.email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
    const router = useRouter()

    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    })

    const onSubmit = async (values: LoginFormValues) => {
        console.log(values)
    }

    const isPending = form.formState.isSubmitting

    return (
        <div className="flex flex-col gap-6">
            
        </div>
    )
