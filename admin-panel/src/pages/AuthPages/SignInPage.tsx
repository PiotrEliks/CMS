import PageMeta from '../../components/common/PageMeta'
import AuthLayout from './AuthPageLayout'
import SignInForm from '../../components/auth/SignInForm'

export default function SignInPage() {
    return (
        <>
            <PageMeta
                title="Logowanie"
                description="To jest strona logowania do panelu administracyjnego"
            />
            <AuthLayout>
                <SignInForm />
            </AuthLayout>
        </>
    )
}
