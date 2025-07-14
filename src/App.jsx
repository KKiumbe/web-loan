
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Box } from "@mui/material";
import { useAuthStore, useThemeStore } from "./store/authStore";
import { getTheme } from "./store/theme";





import ProtectedRoute from "./ProtectedRoute";
import Navbar from "./global/navbar";
import Sidebar from "./global/sidebar";
import Login from "./pages/auth/login";
import ForgotPasswordScreen from "./pages/auth/forgotPassword";
import ChangePasswordScreen from "./pages/auth/ChangePasswordScreen";
import VerifyOtpScreen from "./pages/auth/VerifyOtpScreen";
import HomeScreen from "./pages/home/home";
import EmployeeListScreen from "./pages/customers/customers";
import OrganizationsScreen from "./pages/organization/organizations";
import LoanRequestsScreen from "./pages/loans/loanRequest";
import CreateEmployeeScreen from "./pages/customers/addCustomers";
import LoansScreen from "./pages/loans/loans";
import InvoiceDetails from "./pages/invoices/InvoiceDetail";
import CustomerDetails from "./pages/customers/customerDetails";
import OrganizationAdminDetail from "./pages/organization/orgAdminDetails";
import EditOrganization from "./pages/organization/editOrg";
import Payments from "./pages/payments/payments";
import PaymentConfirmations from "./pages/payments/paymentsIn";
import PaymentBatches from "./pages/payments/paymentBatches";
import CreatePayment from "./pages/payments/addPayment";
import OrganizationAdminsScreen from "./pages/organization/orgAdmins";
import Receipts from "./pages/receipts/receipts";
import ReceiptDetail from "./pages/receipts/receiptDetails";
import SentSMSPage from "./pages/sms/sentSMS";
import SmsScreen from "./pages/sms/sendSMS";
import SendBillsScreen from "./pages/sms/sendBills";
import DebtManager from "./pages/sms/debtManager/debtManager";
import ReportScreen from "./pages/reports/reports";
import ComingSoonPage from "./pages/comming/comingSoon";
import CustomerEditScreen from "./pages/customers/editCustomers";
import UserManagementScreen from "./pages/user/users";
import AddUser from "./pages/user/addUser";
import UserDetails from "./pages/user/userDetails";
import Organization from "./pages/organization/orgDetails";
import CreateOrganizationScreen from "./pages/organization/addOrg";
import OrganizationDetailScreen from "./pages/organization/orgDetailPage";
import CreateOrgAdminScreen from "./pages/organization/addOrgAdmin";
import AssignTaskScreen from "./pages/tasks/createTask";
import FetchTasksScreen from "./pages/tasks/fetchTasks";
import TaskDetailsScreen from "./pages/tasks/taskDetails";




const App = () => {
  const { darkMode } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const theme = getTheme(darkMode ? "dark" : "light");


  

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box
          sx={{
            minHeight: "100vh", // Full viewport height
            width: "100%", // Full width
            backgroundColor: theme.palette.background.default, // Theme background
            display: "flex", // Flexbox for sidebar and content
            flexDirection: "row",
          }}
        >
          {isAuthenticated && <Sidebar />}
          <Box
            sx={{
              flexGrow: 1, // Takes remaining space
              display: "flex",
              flexDirection: "column",
              minHeight: "100vh", // Ensure content fills height
            }}
          >
            {isAuthenticated && <Navbar />}
            <Box
              component="main"
              sx={{
                flexGrow: 1, // Content expands to fill space
                backgroundColor: theme.palette.background.default, // Consistent background
                p: 3, // Padding for content
              }}
            >
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ForgotPasswordScreen />} />
                <Route path="/change-password" element={<ChangePasswordScreen/>} />
                <Route path="/verify-otp" element={<VerifyOtpScreen />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <HomeScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customers"
                  element={
                    <ProtectedRoute>
                      <EmployeeListScreen />
                    </ProtectedRoute>
                  }
                />


                  <Route
                  path="/organizations"
                  element={
                    <ProtectedRoute>
                      <OrganizationsScreen/>
                    </ProtectedRoute>
                  }
                /> 








               
                <Route
                  path="/loan-requests"
                  element={
                    <ProtectedRoute>
                      <LoanRequestsScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-customer"
                  element={
                    <ProtectedRoute>
                      <CreateEmployeeScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/loans"
                  element={
                    <ProtectedRoute>
                      <LoansScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/get-invoice/:id"
                  element={
                    <ProtectedRoute>
                      <InvoiceDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user-details/:id"
                  element={
                    <ProtectedRoute>
                      <CustomerDetails />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/org-admins/:id"
                  element={
                    <ProtectedRoute>
                      <OrganizationAdminDetail />
                    </ProtectedRoute>
                  }
                />
                <Route

                path="/edit-org/:id"

                 element={
                    <ProtectedRoute>
                      <EditOrganization />
                    </ProtectedRoute>
                  }
                
                />



                <Route
                  path="/payments"
                  element={
                    <ProtectedRoute>
                      <Payments />
                    </ProtectedRoute>
                  }
                />

                  <Route
                  path="/payments-in"
                  element={
                    <ProtectedRoute>
                      <PaymentConfirmations />
                    </ProtectedRoute>
                  }
                />


                  <Route
                  path="/payments-batches"
                  element={
                    <ProtectedRoute>
                      <PaymentBatches />
                    </ProtectedRoute>
                  }
                />

                 

                

                {/* <Route
                  path="/payments/:id"
                  element={
                    <ProtectedRoute>
                      <PaymentDetails />
                    </ProtectedRoute>
                  }
                /> */}
                <Route
                  path="/add-payment"
                  element={
                    <ProtectedRoute>
                      <CreatePayment />
                    </ProtectedRoute>
                  }
                />


                    


                   <Route
                  path="/org-admins"
                  element={
                    <ProtectedRoute>
                      <OrganizationAdminsScreen />
                    </ProtectedRoute>
                  }  
                /> 


                

                

                <Route
                  path="/receipts"
                  element={
                    <ProtectedRoute>
                      <Receipts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/receipts/:id"
                  element={
                    <ProtectedRoute>
                      <ReceiptDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sent-sms"
                  element={
                    <ProtectedRoute>
                      <SentSMSPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/send-sms"
                  element={
                    <ProtectedRoute>
                      <SmsScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/send-bills"
                  element={
                    <ProtectedRoute>
                      <SendBillsScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/debt-management"
                  element={
                    <ProtectedRoute>
                      <DebtManager />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/view-reports"
                  element={
                    <ProtectedRoute>
                      <ReportScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/request-custom-reports"
                  element={
                    <ProtectedRoute>
                      <ComingSoonPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer-edit/:id"
                  element={
                    <ProtectedRoute>
                      <CustomerEditScreen/>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute>
                      <UserManagementScreen />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-user"
                  element={
                    <ProtectedRoute>
                      <AddUser />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/:id"
                  element={
                    <ProtectedRoute>
                      <UserDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/org-details"
                  element={
                    <ProtectedRoute>
                      <Organization />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organization/edit"
                  element={
                    <ProtectedRoute>
                      <EditOrganization />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/create-organization"
                  element={
                    <ProtectedRoute>
                      <CreateOrganizationScreen />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/org-details/:orgId"
                  element={
                    <ProtectedRoute>
                      <OrganizationDetailScreen />
                    </ProtectedRoute>
                  }
                  />

                  <Route
                  path="/org-admins/create"
                  element={
                    <ProtectedRoute>
                      <CreateOrgAdminScreen />
                    </ProtectedRoute>
                  }
                  />


                  <Route
                  path="tasks/create"
                  element={
                    <ProtectedRoute>
                      <AssignTaskScreen />
                    </ProtectedRoute>
                  }
                />

                  <Route
                  path="tasks"
                  element={
                    <ProtectedRoute>
                      <FetchTasksScreen />
                    </ProtectedRoute>
                  }
                />  

<Route
                  path="task-details/:taskId"
                  element={
                    <ProtectedRoute>
                      <TaskDetailsScreen />
                    </ProtectedRoute>
                  }
                />  
              </Routes>
            </Box>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;