import { useRegisterSW } from 'virtual:pwa-register/react'
import { toast } from 'sonner'
import { useEffect } from 'react'

export function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r: ServiceWorkerRegistration | undefined) {
            console.log('SW Registered: ' + r)
        },
        onRegisterError(error: Error) {
            console.log('SW registration error', error)
        },
    })

    useEffect(() => {
        if (offlineReady) {
            toast.success('App ready to work offline')
            setOfflineReady(false)
        }
    }, [offlineReady, setOfflineReady])

    useEffect(() => {
        if (needRefresh) {
            toast.info('New content available, click on reload button to update.', {
                action: {
                    label: 'Reload',
                    onClick: () => updateServiceWorker(true),
                },
                duration: Infinity,
            })
        }
    }, [needRefresh, updateServiceWorker])

    return null
}
