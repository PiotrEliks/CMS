import { useState } from 'react'
import { PlusIcon } from '../../../icons'
import Button from '../../ui/button/Button'
import SectionTypeModal from './SectionTypeModal'

interface AddSectionButtonProps {
    contentId: string
    variant?: 'primary' | 'outline'
    size?: 'sm' | 'md'
}

export default function AddSectionButton({
    contentId,
    variant = 'outline',
    size = 'md',
}: AddSectionButtonProps) {
    const [modalOpen, setModalOpen] = useState(false)

    return (
        <>
            <Button
                variant={variant}
                size={size}
                startIcon={<PlusIcon />}
                onClick={() => setModalOpen(true)}
            >
                Dodaj sekcję
            </Button>

            <SectionTypeModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                contentId={contentId}
            />
        </>
    )
}
