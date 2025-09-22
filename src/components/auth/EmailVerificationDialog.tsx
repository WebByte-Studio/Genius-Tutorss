'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Mail, Clock, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import emailVerificationService from '@/services/emailVerificationService'

interface EmailVerificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
  fullName: string
  onVerificationSuccess: (data?: { user: any; token: string }) => void
  onResendOTP?: () => void
}

export const EmailVerificationDialog: React.FC<EmailVerificationDialogProps> = ({
  open,
  onOpenChange,
  email,
  fullName,
  onVerificationSuccess,
  onResendOTP
}) => {
  const [otpCode, setOtpCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const [isVerified, setIsVerified] = useState(false)

  // Timer countdown
  useEffect(() => {
    if (!open || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [open, timeLeft])

  // Reset timer when dialog opens
  useEffect(() => {
    if (open) {
      setTimeLeft(600)
      setOtpCode('')
      setIsVerified(false)
    }
  }, [open])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP code')
      return
    }

    setLoading(true)
    try {
      const result = await emailVerificationService.completeRegistration(email, otpCode)
      setIsVerified(true)
      toast.success('Email verified successfully!')
      
      // Wait a moment to show success state
      setTimeout(() => {
        onVerificationSuccess(result.data)
        onOpenChange(false)
      }, 1500)
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setResendLoading(true)
    try {
      await emailVerificationService.resendOTP(email, fullName)
      setTimeLeft(600) // Reset timer
      toast.success('OTP resent successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP')
    } finally {
      setResendLoading(false)
    }
  }

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6) // Only allow digits, max 6
    setOtpCode(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 border-0 shadow-2xl rounded-2xl overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-green-500/5 to-emerald-400/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-400/20 to-transparent rounded-full blur-2xl"></div>
        
        <DialogHeader className="relative z-10 text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            {isVerified ? (
              <CheckCircle className="w-8 h-8 text-white" />
            ) : (
              <Mail className="w-8 h-8 text-white" />
            )}
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 bg-clip-text text-transparent">
            {isVerified ? 'Email Verified!' : 'Verify Your Email'}
          </DialogTitle>
          <p className="text-green-600/80 text-sm mt-2">
            {isVerified 
              ? 'Your email has been successfully verified!' 
              : `We've sent a verification code to ${email}`
            }
          </p>
        </DialogHeader>

        {!isVerified && (
          <div className="relative z-10 space-y-6">
            {/* Timer */}
            <div className="flex items-center justify-center space-x-2 text-sm">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-green-700 font-medium">
                Code expires in: {formatTime(timeLeft)}
              </span>
            </div>

            {/* OTP Input Form */}
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-semibold text-green-800">
                  Enter Verification Code
                </Label>
                <div className="relative">
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otpCode}
                    onChange={handleOTPChange}
                    className="h-12 text-center text-2xl font-mono tracking-widest bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all duration-300 backdrop-blur-sm"
                    maxLength={6}
                    disabled={loading || timeLeft === 0}
                  />
                </div>
                <p className="text-xs text-green-600/70 text-center">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300" 
                disabled={loading || otpCode.length !== 6 || timeLeft === 0}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </Button>
            </form>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-sm text-green-600/70 mb-3">
                Didn't receive the code?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleResendOTP}
                disabled={resendLoading || timeLeft > 540} // Disable if less than 1 minute has passed
                className="border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-400"
              >
                {resendLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend Code
                  </>
                )}
              </Button>
            </div>

            {/* Warning for expired code */}
            {timeLeft === 0 && (
              <div className="flex items-center space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <p className="text-sm text-amber-700">
                  Verification code has expired. Please request a new one.
                </p>
              </div>
            )}
          </div>
        )}

        {isVerified && (
          <div className="relative z-10 text-center py-4">
            <div className="animate-pulse">
              <p className="text-green-600 font-medium">
                Redirecting you to complete your registration...
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
