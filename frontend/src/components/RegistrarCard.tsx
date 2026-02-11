import RegistrarLogo from './RegistrarLogo'
import StatusBadge from './StatusBadge'
import RegisterButton from './RegisterButton'
import type { PromiseResult } from '../types'

interface RegistrarCardProps {
    result: PromiseResult
    isRecommended?: boolean
}

const RegistrarCard = ({ result, isRecommended = false }: RegistrarCardProps) => {
    const isFulfilled = result.status === 'fulfilled'
    const data = isFulfilled ? result.value : null
    
    if (!data) {
        if(result.status === 'rejected'){
            return (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.5rem',
                    backgroundColor: '#fff',
                    borderBottom: '1px solid #eee',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <RegistrarLogo registrar={result.reason.registrar || 'Unknown'} />
                        <span style={{ fontWeight: 500, fontSize: '1.1rem' }}>
                            {result.reason.registrar || 'Unknown'}
                        </span>
                    </div>
                    <StatusBadge status="error" />
                    <span style={{ color: '#aaa' }}>—</span>
                    <RegisterButton disabled />
                </div>
            )
        }
        return null
    }

    const statusStr = typeof data.status === 'string' ? data.status.toLowerCase() : ''
    const isAvailable = data.status === true || statusStr === 'available'
    const isAftermarket = statusStr.includes('aftermarket')
    const canRegister = isAvailable || isAftermarket

    const formatPrice = (price: string | number | null) => {
        if (!price || price === '') return '—'
        if (typeof price === 'number') return `₹${price}/year`
        return `${price}/year`
    }

    if (isRecommended) {
        return (
            <div style={{
                border: '2px solid #f5a623',
                borderRadius: '1rem',
                overflow: 'hidden',
                marginBottom: '2rem',
            }}>
                <div style={{
                    backgroundColor: '#f5a623',
                    padding: '0.5rem 1.5rem',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: '#111',
                }}>
                    RECOMMENDED — LOWEST PRICE
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.5rem',
                    backgroundColor: '#fffbf0',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <RegistrarLogo registrar={data.registrar} size={50} />
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '1.25rem' }}>{data.registrar}</div>
                            <StatusBadge status={data.status} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '1.5rem' }}>
                            {formatPrice(data.price)}
                        </span>
                        <RegisterButton registrar={data.registrar} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            backgroundColor: '#fff',
            borderBottom: '1px solid #eee',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '180px' }}>
                <RegistrarLogo registrar={data.registrar} />
                <span style={{ fontWeight: 500, fontSize: '1.1rem' }}>{data.registrar}</span>
            </div>
            <StatusBadge status={data.status} />
            <span style={{ 
                fontWeight: 500, 
                fontSize: '1rem',
                color: canRegister ? '#111' : '#aaa',
                minWidth: '100px',
                textAlign: 'right',
            }}>
                {canRegister ? formatPrice(data.price) : '—'}
            </span>
            <RegisterButton registrar={data.registrar} disabled={!canRegister} />
        </div>
    )
}

export default RegistrarCard
