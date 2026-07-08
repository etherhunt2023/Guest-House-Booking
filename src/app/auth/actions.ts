'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()
  
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    return { error: error.message }
  }
  
  const role = data.user?.user_metadata?.role || 'guest'
  
  revalidatePath('/', 'layout')
  
  if (role === 'admin') {
    redirect('/admin')
  } else if (role === 'manager') {
    redirect('/manager')
  } else if (role === 'caretaker') {
    redirect('/caretaker')
  } else {
    redirect('/dashboard')
  }
}

export async function signup(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const department = formData.get('department') as string
  const designation = formData.get('designation') as string
  const role = (formData.get('role') as string) || 'guest'
  
  if (!email || !password || !fullName || !phone) {
    return { error: 'Required fields are missing' }
  }

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
        department,
        designation,
        role,
      },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })
  
  if (error) {
    return { error: error.message }
  }
  
  return { success: true, message: 'Registration successful! Please check your email to verify your account.' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function resetPassword(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  
  if (!email) {
    return { error: 'Email is required' }
  }

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/update-password`,
  })
  
  if (error) {
    return { error: error.message }
  }
  
  return { success: true, message: 'Password reset link sent to your email.' }
}

export async function updatePassword(prevState: unknown, formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  
  if (!password || !confirmPassword) {
    return { error: 'All fields are required' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  const supabase = await createClient()
  
  const { error } = await supabase.auth.updateUser({
    password,
  })
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/', 'layout')
  redirect('/login?message=Password updated successfully. Please login with your new password.')
}
