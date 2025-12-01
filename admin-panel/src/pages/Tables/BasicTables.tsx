import { useState } from "react";
import type { User } from "../../store/users";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BasicTableOne from "../../components/tables/BasicTables/BasicTableOne";
import Button from "../../ui/button/Button";
import { UserIcon } from "../../icons";
import UserFormModal from "../../components/ui/modal/UserFormModal";

export default function BasicTables() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleCreateNew = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };
  return (
    <>
      <div className="space-y-6">
        <ComponentCard title="Użytkownicy" button={<Button size="sm" variant="primary" startIcon={<UserIcon />} onClick={handleCreateNew} >Utwórz nowego</Button>}>
          <BasicTableOne onEdit={handleEditUser} />
        </ComponentCard>
      </div>

       <UserFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userToEdit={editingUser}
      />
    </>
  );
}
