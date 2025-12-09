import PageBreadcrumb from '../components/common/PageBreadCrumb';
import PageMeta from '../components/common/PageMeta';
import FormElements from './Forms/FormElements';
import RolesTable from './Tables/RolesTable';

export default function Roles() {
  return (
    <>
      <PageMeta
        title="React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Zarządzanie rolami" />
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 lg:p-6">
        <div className="space-y-6">
          <RolesTable />
        </div>
      </div>
    </>
  );
}
