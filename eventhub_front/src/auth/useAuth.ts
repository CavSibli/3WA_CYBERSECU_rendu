import { useContext } from 'react'
import { AuthContext } from './authContext'
import type { AuthContextValue } from './authContext'

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  // #region agent log
  fetch('http://127.0.0.1:7723/ingest/3e757b8c-e55b-48a6-b819-71791092e113',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'432427'},body:JSON.stringify({sessionId:'432427',runId:'run1',hypothesisId:'H1',location:'src/auth/useAuth.ts:7',message:'useAuth evaluated context',data:{hasContext:Boolean(ctx)},timestamp:Date.now()})}).catch(()=>{})
  // #endregion
  if (!ctx) {
    // #region agent log
    fetch('http://127.0.0.1:7723/ingest/3e757b8c-e55b-48a6-b819-71791092e113',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'432427'},body:JSON.stringify({sessionId:'432427',runId:'run1',hypothesisId:'H3',location:'src/auth/useAuth.ts:10',message:'useAuth missing provider',data:{},timestamp:Date.now()})}).catch(()=>{})
    // #endregion
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}