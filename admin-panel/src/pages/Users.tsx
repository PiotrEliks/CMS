import PageBreadcrumb from '../components/common/PageBreadCrumb';
import PageMeta from '../components/common/PageMeta';
import FormElements from './Forms/FormElements';
import UsersTable from './Tables/UsersTable';

export default function Users() {
  return (
    <>
      <PageMeta
        title="Zarządzanie użytkownikami"
        description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Zarządzanie użytkownikami" />
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 lg:p-6">
        <div className="space-y-6">
          <UsersTable />
        </div>
      </div>
    </>
  );
}
