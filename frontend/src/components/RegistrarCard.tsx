import RegistrarLogo from './RegistrarLogo'
import StatusBadge from './StatusBadge'
import RegisterButton from './RegisterButton'
import { usePricing } from '../pricing/context'
import type { PriceView } from '../pricing/currency'
import type { PromiseResult } from '../types'

interface RegistrarCardProps {
    result: PromiseResult
    domain: string
    isRecommended?: boolean
}

// Price in the visitor's currency, with the registrar's own price underneath when converted
const Price = ({ view, size }: { view: PriceView, size: string }) => {
    if (!view.main) return <>—</>
    return (
        <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: size }}>{view.main}/year</span>
            {view.original && (
                <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#999' }} title="The registrar's own price">
                    {view.original}
                </span>
            )}
        </span>
    )
}

const RegistrarCard = ({ result, domain, isRecommended = false }: RegistrarCardProps) => {
    const { view } = usePricing()
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

    const price = view(data)

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
                        <span style={{ fontWeight: 600 }}>
                            <Price view={price} size="1.5rem" />
                        </span>
                        <RegisterButton registrar={data.registrar} domain={domain} url={data.url} />
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
                {canRegister ? <Price view={price} size="1rem" /> : '—'}
            </span>
            <RegisterButton registrar={data.registrar} domain={domain} url={data.url} disabled={!canRegister} />
        </div>
    )
}

export default RegistrarCard
