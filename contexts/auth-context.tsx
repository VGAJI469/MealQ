'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { type Student } from '@/lib/mock-data'
import { loginUser, registerUser } from '@/lib/api'

interface AuthContextType {
  student: Student | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (studentId: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: any) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const storedStudent = localStorage.getItem('mealq_student')
      const storedToken = localStorage.getItem('mealq_token')

      if (storedStudent && storedToken) {
        const parsedStudent = JSON.parse(storedStudent)
        if (parsedStudent && typeof parsedStudent === 'object') {
          setStudent(parsedStudent)
        }
      }
    } catch (error) {
      console.error('Failed to restore auth state:', error)
      localStorage.removeItem('mealq_student')
      localStorage.removeItem('mealq_token')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (
    student_id: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const data = await loginUser(student_id, password)
      setStudent(data.student)
      localStorage.setItem('mealq_student', JSON.stringify(data.student))
      localStorage.setItem('mealq_token', data.access_token)
      return { success: true }
    } catch (error: any) {
      const message = error?.message || 'Login failed. Please try again.'
      return { success: false, error: message }
    }
  }

  const register = async (formData: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const data = await registerUser(formData)
      setStudent(data.student)
      localStorage.setItem('mealq_student', JSON.stringify(data.student))
      localStorage.setItem('mealq_token', data.access_token)
      return { success: true }
    } catch (error: any) {
      const message = error?.message || 'Registration failed. Please try again.'
      return { success: false, error: message }
    }
  }

  const logout = () => {
    setStudent(null)
    localStorage.removeItem('mealq_student')
    localStorage.removeItem('mealq_token')
  }

  return (
    <AuthContext.Provider
      value={{
        student,
        isAuthenticated: !!student,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
