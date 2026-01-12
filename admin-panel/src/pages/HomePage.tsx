import PageMeta from '../components/common/PageMeta';
import PageBreadcrumb from '../components/common/PageBreadCrumb';

export default function HomePage() {
  return (
    <>
      <PageMeta
        title="Strona główna panelu administracyjnego"
        description="To jest strona główna panelu administracyjnego systemu CMS"
      />
      <PageBreadcrumb pageTitle="Strona główna" />
      <div className="grid grid-cols-12 gap-4 md:gap-6">TODO</div>
    </>
  );
}
