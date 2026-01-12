import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import UsersTable from '../../components/tables/UsersTable';

export default function UsersPage() {
  return (
    <>
      <PageMeta
        title="Zarządzanie użytkownikami"
        description="Strona zarządzania użytkownikami w panelu administracyjnym"
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
