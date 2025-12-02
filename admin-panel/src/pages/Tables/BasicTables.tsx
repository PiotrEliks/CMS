import { useState } from "react";
import type { User } from "../../store/users";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import Button from "../../ui/button/Button";
import { UserIcon } from "../../icons";
import UserFormModal from "../../components/ui/modal/UserFormModal";
import { useUsers } from "../../store/users";
import DeleteConfirmModal from "../../components/modal/DeleteConfirmModal";

export default function BasicTables() {
  const { deleteUser } = useUsers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);


  const handleCreateNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const askDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.user_id);
    } finally {
      setDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  return (
    <>
      <div className="space-y-6">
        <ComponentCard title="Użytkownicy" button={<Button size="sm" variant="primary" startIcon={<UserIcon />} onClick={handleCreateNew} >Utwórz nowego</Button>}>
          <BasicTableOne onEdit={handleEditUser} onDelete={askDeleteUser} />
        </ComponentCard>
      </div>

       <UserFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userToEdit={editingUser}
      />

      <DeleteConfirmModal
        open={deleteModalOpen}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        title="Usuń użytkownika"
        message={
          userToDelete
            ? `Czy na pewno chcesz usunąć użytkownika "${userToDelete.email}"?`
            : "Czy na pewno chcesz usunąć ten element?"
        }
      />

    </>
  );
}
