import React, { useEffect, useState } from "react";
import { Typography, Card, CardContent, Box, CircularProgress } from "@mui/material";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import { getTheme } from "../../store/theme";
import TotalCustomersDisplay from "../../components/TotalCustomersDisplay";
import ProgressCircleComponent from "../../components/progresCircle";
import ProgressBarComponent from "../../components/ProgressBarComponent";
import PieChartComponent from "../../components/pieChart";
import LastPayments from "../../components/payments";
import PaymentModesPieChart from "../../components/paymentsChart";

const HomeScreen = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  const currentUser = useAuthStore((state) => state.currentUser);
  const navigate = useNavigate();
  const theme = getTheme();
  const BASEURL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser]);

  useEffect(() => {
    fetchDashboardStats();
    fetchPayments();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Simulate API response with fake data
      const fakeStats = {
        totalCustomers: 1000,
        lowBalanceCustomers: 200,
        unpaidCustomers: 150,
        highBalanceCustomers: 300,
      };
      setDashboardStats(fakeStats);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
      }
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      // Simulate API response with fake payments data
      const fakePayments = [
        {
          id: 1,
          customerName: "John Doe",
          amount: 150.75,
          date: "2025-07-10",
          paymentMode: "Credit Card",
          status: "Completed",
        },
        {
          id: 2,
          customerName: "Jane Smith",
          amount: 89.99,
          date: "2025-07-09",
          paymentMode: "Bank Transfer",
          status: "Pending",
        },
        {
          id: 3,
          customerName: "Alice Johnson",
          amount: 250.0,
          date: "2025-07-08",
          paymentMode: "Mobile Payment",
          status: "Completed",
        },
        {
          id: 4,
          customerName: "Bob Williams",
          amount: 45.5,
          date: "2025-07-07",
          paymentMode: "Cash",
          status: "Failed",
        },
        {
          id: 5,
          customerName: "Emma Brown",
          amount: 120.25,
          date: "2025-07-06",
          paymentMode: "Credit Card",
          status: "Completed",
        },
      ];
      setPayments(fakePayments);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate("/login");
      }
      console.error("Error fetching payments:", error);
    } finally {
      setPaymentsLoading(false);
    }
  };

  if (loading || paymentsLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: theme?.palette?.background?.default || "#f5f5f5",
          width: "100vw",
          margin: 0,
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const total = dashboardStats?.totalCustomers || 0;

  return (
    <Box
      sx={{
        width: "100vw",
        margin: 0,
        padding: 2,
        boxSizing: "border-box",
      }}
    >
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          mb: 6,
          color: theme?.palette?.text?.primary || "#000",
          fontWeight: "bold",
        }}
      >
        Hi {currentUser.firstName}!
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr", // 1 column on extra small screens
            sm: "repeat(2, 1fr)", // 2 columns on small screens
            md: "repeat(3, 1fr)", // 3 columns on medium screens
            lg: "repeat(4, 1fr)", // 4 columns on large screens
          },
          gap: 2, // Reduced gap between cards (was 3)
          maxWidth: "1400px", // Set a maximum width for the grid
          mx: "auto", // Center the grid
          paddingRight: 30,
        }}
      >
        <Card
          sx={{
            width: "100%", // Full width of grid cell
            maxWidth: 250, // Maximum card width
            maxHeight: 250,
            boxShadow: 3,
            bgcolor: theme?.palette?.background?.default || "#fafafa",
            borderRadius: 2,
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.02)" },
          }}
        >
          <CardContent>
            <TotalCustomersDisplay data={dashboardStats?.totalCustomers || 0} />
          </CardContent>
        </Card>

        <Card
          sx={{
            width: "100%",
            maxWidth: 250,
            maxHeight: 250,
            boxShadow: 3,
            bgcolor: theme?.palette?.background?.default || "#fafafa",
            borderRadius: 2,
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.02)" },
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: theme?.palette?.primary.contrastText || "#666", ml: 7 }}
            >
              Paid Up
            </Typography>
            <ProgressCircleComponent
              data={dashboardStats?.lowBalanceCustomers || 0}
              maxValue={total}
            />
          </CardContent>
        </Card>

        <Card
          sx={{
            width: "100%",
            maxWidth: 250,
            maxHeight: 250,
            boxShadow: 3,
            bgcolor: theme?.palette?.background?.default || "#fafafa",
            borderRadius: 2,
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.02)" },
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: theme?.palette?.primary.dark || "#666" }}
            >
              Unpaid
            </Typography>
            <ProgressBarComponent
              data={
                total > 0
                  ? Math.round((dashboardStats?.unpaidCustomers / total) * 100) || 0
                  : 0
              }
              label="Unpaid"
            />
          </CardContent>
        </Card>

        <Card
          sx={{
            width: "100%",
            maxWidth: 250,
            maxHeight: 300,
            boxShadow: 3,
            bgcolor: theme?.palette?.background?.default || "#fafafa",
            borderRadius: 2,
            transition: "transform 0.2s",
            "&:hover": { transform: "scale(1.02)" },
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: theme?.palette?.primary.contrastText || "#666" }}
            >
              High Balance
            </Typography>
            <PieChartComponent
              data={dashboardStats?.highBalanceCustomers || 0}
              label="High Balance"
              maxValue={total}
            />
          </CardContent>
        </Card>
      </Box>

      <Box
        sx={{
          mt: 5,
          maxWidth: "1600px",
          mx: "auto",
          bgcolor: theme?.palette?.background?.paper || "#fafafa",
        }}
      >
        <Typography variant="h6" sx={{ mb: 3 }}>
          Recent Transactions
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" }, // Stack on small screens, row on medium+
            gap: 10,
            justifyContent: "flex-start",
            alignItems: "flex-start",
            width: "100%",
            bgcolor: theme?.palette?.background?.paper || "#fafafa",
          }}
        >
          <Card
            sx={{
              flex: { md: 1 }, // Equal flex growth on medium screens and up
              maxWidth: { xs: "100%", md: 600 },
              boxShadow: 3,
              bgcolor: theme?.palette?.background.paper || "#fafafa",
              borderRadius: 2,
              transition: "transform 0.2s",
              "&:hover": { transform: "scale(1.02)" },
              width: "100%",
            }}
          >
            <CardContent>
              <LastPayments payments={payments} />
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: { md: 1 }, // Equal flex growth on medium screens and up
              maxWidth: { xs: "100%", md: 300 },
              boxShadow: 3,
              bgcolor: theme?.palette?.background?.paper || "#fafafa",
              borderRadius: 2,
              transition: "transform 0.2s",
              "&:hover": { transform: "scale(1.02)" },
            }}
          >
            <CardContent>
              <PaymentModesPieChart payments={payments} />
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default HomeScreen;