import { Head, useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const handleSubmit = (e: any) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title='Login' />
            <main className="min-h-screen flex flex-col items-center justify-center">
                <div className="py-4 px-4 md:px-8">
                    <div className="grid lg:grid-cols-2 items-center gap-6 max-w-6xl w-full">
                        <div
                            className="border border-slate-300 rounded-lg p-6 max-w-md mx-auto shadow-sm md:p-8 lg:mx-0 dark:border-neutral-700">

                            <div className="mb-8">
                                <h1 className="text-slate-900 text-3xl font-bold mb-4 dark:text-slate-50">Iniciar sesión</h1>
                                <p className="text-slate-600 text-base leading-relaxed dark:text-slate-400">Inicia sesión en tu cuenta para acceder a tu panel de control y gestionar tus pedidos.</p>
                            </div>

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="email"
                                        className="mb-2 text-slate-900 font-medium text-sm inline-block dark:text-slate-50">Correo electrónico</label>
                                    <input type="email" id="email" name="email" placeholder="john.doe@gmail.com" required
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-800 dark:outline-neutral-700"
                                    />
                                    {errors.email && (
                                        <p>{errors.email}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="password"
                                        className="mb-2 text-slate-900 font-medium text-sm inline-block dark:text-slate-50">Contraseña</label>
                                    <input type="password" id="password" name="password" placeholder="••••••••" required
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-800 dark:outline-neutral-700" />
                                    {errors.password && (
                                        <p>{errors.password}</p>
                                    )}
                                </div>

                                <div className="flex items-start flex-wrap gap-2">
                                    <label className="flex items-center group has-[input:checked]:text-slate-900">
                                        <input id="remember" name="remember" type="checkbox" className="sr-only" />
                                        {/* Custom box */}
                                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded outline-1 outline-slate-300 dark:outline-neutral-700
                                 bg-white dark:bg-neutral-800
                                 group-has-[input:checked]:bg-blue-600
                                 group-has-[input:checked]:outline-blue-600
                                 group-focus-within:outline-2
                                 group-focus-within:outline-blue-600" aria-hidden="true">
                                            {/* Checkmark */}
                                            <svg className="size-3 text-white opacity-0 group-has-[input:checked]:opacity-100"
                                                viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 5l3 3 7-7" />
                                            </svg>
                                        </span>
                                        <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">
                                            Recordarme
                                        </span>
                                    </label>

                                    <a href="#"
                                        className="ml-auto text-sm font-medium text-blue-700 dark:text-blue-500 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                                        ¿Olvidaste tu contraseña?
                                    </a>
                                </div>

                                <button type="submit" disabled={processing}
                                    className="w-full py-2 px-3.5 text-sm rounded-md font-semibold cursor-pointer tracking-wide text-white border border-blue-600 bg-blue-600 hover:bg-blue-700 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                     {processing ? 'Ingresando...' : 'Iniciar sesión'}
                                </button>


                            </form>
                        </div>

                        <div className="aspect-[71/50] max-lg:w-4/5 mx-auto">
                            <img src="https://readymadeui.com/images/integration-illus.webp" className="w-full object-cover"
                                alt="login img" />
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}