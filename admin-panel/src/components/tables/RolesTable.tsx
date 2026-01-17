import { useState } from 'react'
import type { Role } from '../../store/roles'
import ComponentCard from '../../components/common/ComponentCard'
import RoleTableOne from '../../components/tables/RoleTableOne'
import Button from '../../ui/button/Button'
import { UserIcon } from '../../icons'
import RoleFormModal from '../../components/ui/modal/RoleFormModal'
import DeleteConfirmModal from '../../components/modal/DeleteConfirmModal'
import { useRoles } from '../../store/roles'

export default function RolesTable() {
  const { deleteRole } = useRoles()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  const handleCreateNew = () => {
    setEditingRole(null)
    setIsModalOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    setIsModalOpen(true)
  }

  const askDeleteRole = (role: Role) => {
    setRoleToDelete(role)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!roleToDelete) return

    try {
      await deleteRole(roleToDelete.role_id)
    } finally {
      setDeleteModalOpen(false)
      setRoleToDelete(null)
    }
  }

  const cancelDelete = () => {
    setDeleteModalOpen(false)
    setRoleToDelete(null)
  }

  return (
    <>
      <div className="space-y-6">
        <ComponentCard
          title="Role"
          button={
            <Button
              size="sm"
              variant="primary"
              startIcon={<UserIcon />}
              onClick={handleCreateNew}
            >
              Utwórz nową
            </Button>
          }
        >
          <RoleTableOne onEdit={handleEditRole} onDelete={askDeleteRole} />
        </ComponentCard>
      </div>

      <RoleFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        roleToEdit={editingRole}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        title="Usuń rolę"
        message={
          roleToDelete
            ? `Czy na pewno chcesz usunąć rolę "${roleToDelete.display_name}"?`
            : 'Czy na pewno chcesz usunąć ten element?'
        }
      />
    </>
  )
}
