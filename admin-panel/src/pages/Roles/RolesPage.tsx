import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import RolesTable from '../../components/tables/RolesTable';

export default function RolesPage() {
  return (
    <>
      <PageMeta
        title="Zarządzanie rolami"
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
