import React, { useState, useEffect } from 'react'
import { useOtp } from '../hooks/useOtp'

interface Props {
  onSuccess?: () => void
  onCancel?: () => void
}

export const OtpSetup: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const { enable, getQr, loading, error } = useOtp()
  const [step, setStep] = useState<'qr' | 'verify' | 'success'>('qr')
  const [qrCode, setQrCode] = useState<{ image: string; username: string; secret: string } | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  useEffect(() => {
    const loadQrCode = async () => {
      try {
        const qr = await getQr()
        setQrCode(qr)
      } catch {
        // Error handled by hook
      }
    }
    if (step === 'qr') {
      void loadQrCode()
    }
  }, [step, getQr])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!qrCode) return

    try {
      const codes = await enable(qrCode.secret, verificationCode)
      setBackupCodes(codes)
      setStep('success')
      if (onSuccess) onSuccess()
    } catch {
      // Error handled by hook
    }
  }

  if (step === 'qr') {
    return (
      <div className="card">
        <h2>Activer l'authentification à deux facteurs</h2>
        <p className="muted">
          Scannez ce QR code avec votre application d'authentification (Google Authenticator, Authy, etc.)
        </p>
        {error && <p className="state-message state-error">{error}</p>}
        {loading && <p className="state-message">Chargement du QR code...</p>}
        {qrCode && (
          <>
            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
              <img src={qrCode.image} alt="QR Code OTP" style={{ maxWidth: '300px', width: '100%' }} />
            </div>
            <p className="muted" style={{ fontSize: '0.9rem' }}>
              <strong>Secret (si vous ne pouvez pas scanner) :</strong> {qrCode.secret}
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              {onCancel && (
                <button type="button" className="secondary-button" onClick={onCancel}>
                  Annuler
                </button>
              )}
              <button
                type="button"
                className="primary-button"
                onClick={() => setStep('verify')}
                disabled={loading}
              >
                J'ai scanné le QR code
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  if (step === 'verify') {
    return (
      <form className="card" onSubmit={handleVerify}>
        <h2>Vérifier l'activation</h2>
        <p className="muted">Entrez le code à 6 chiffres affiché par votre application d'authentification.</p>
        {error && <p className="state-message state-error">{error}</p>}
        <label>
          <span>Code de vérification</span>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
            placeholder="123456"
            maxLength={6}
            pattern="[0-9]{6}"
          />
        </label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setStep('qr')}
            disabled={loading}
          >
            Retour
          </button>
          <button type="submit" className="primary-button" disabled={loading || verificationCode.length !== 6}>
            {loading ? 'Activation...' : 'Activer'}
          </button>
        </div>
      </form>
    )
  }

  // step === 'success'
  return (
    <div className="card">
      <h2>OTP activé avec succès !</h2>
      <p className="muted">Votre authentification à deux facteurs est maintenant activée.</p>
      <div style={{ margin: '2rem 0' }}>
        <h3>Codes de secours</h3>
        <p className="muted" style={{ fontSize: '0.9rem' }}>
          Conservez ces codes en lieu sûr. Vous en aurez besoin si vous perdez l'accès à votre application
          d'authentification.
        </p>
        <div
          style={{
            backgroundColor: '#f5f5f5',
            padding: '1rem',
            borderRadius: '4px',
            fontFamily: 'monospace',
            marginTop: '1rem',
          }}
        >
          {backupCodes.map((code, index) => (
            <div key={index} style={{ margin: '0.5rem 0' }}>
              {code}
            </div>
          ))}
        </div>
      </div>
      <button type="button" className="primary-button" onClick={onSuccess || onCancel}>
        Terminer
      </button>
    </div>
  )
}

