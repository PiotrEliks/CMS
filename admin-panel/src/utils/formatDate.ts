export function formatDate(dateString?: string | null) {
    if (!dateString) return 'Brak danych'

    try {
        const date = new Date(dateString)

        return date.toLocaleString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    } catch {
        return 'Niepoprawna data'
    }
}
