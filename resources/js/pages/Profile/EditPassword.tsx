import ChangePasswordForm from '@/features/Profile/ChangePasswordForm'
import Layout from '@/layouts/Layout'
import React from 'react'

export default function EditPassword() {
  return (
    <Layout title='Cambiar contraseña'>
        <div className='space-y-6'>
            <div>
                <h1 className='text-3xl md:text-3xl font-bold'>Cambiar contraseña</h1>
                <p className='text-muted text-sm md:text-base'>Actualiza tu contraseña de forma segura.</p>
            </div>
            
            <div className='w-lg'>
                <ChangePasswordForm />
            </div>
        </div>
    </Layout>
  )
}
