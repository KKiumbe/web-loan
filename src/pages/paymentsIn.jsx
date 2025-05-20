import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import {
  CircularProgress,
  Typography,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import TitleComponent from "../components/title";
import { useAuthStore } from "../store/authStore";
import { getTheme } from "../store/theme";

export default function PaymentConfirmations() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [pagination, setPagination] = useState({ page: 0, pageSize: 10 });
  const [rowCount, setRowCount] = useState(0);

  const currentUser = useAuthStore((s) => s.currentUser);
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const theme = getTheme();

  useEffect(() => {
    if (currentUser) fetchConfirmations();
  }, [currentUser]);

  const fetchConfirmations = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/payment-confirmations`, {
        withCredentials: true,
      });
      // API returns { confirmations: [ ... ] }
      const formatted = res.data.confirmations.map((c) => ({
        id: c.confirmationId,
        amountSettled: c.amountSettled,
        settledAt: c.settledAt,
        payoutId: c.payoutId,
        payoutAmount: c.payoutAmount,
        loanAmount: c.loanAmount,
        firstName: c.firstName,
        lastName: c.lastName,
        organizationName: c.organizationName,
        paymentMethod: c.paymentMethod,
        reference: c.reference,
        receivedAt: c.receivedAt,
        remarks: c.remarks,
      }));
      setRows(formatted);
      setRowCount(formatted.length);
    } catch (err) {
      console.error(err);
      setError("Failed to load payment confirmations");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError("");
  };

  const columns = [
    { field: "id", headerName: "Confirmation ID", width: 130 },
    { field: "payoutId", headerName: "Payout ID", width: 120 },
    { field: "amountSettled", headerName: "Settled (KES)", width: 140, type: "number" },
    { field: "payoutAmount", headerName: "Payout Amt (KES)", width: 150, type: "number" },
    { field: "loanAmount", headerName: "Loan Amt (KES)", width: 140, type: "number" },
    {
      field: "firstName",
      headerName: "First Name",
      width: 130,
    },
    {
      field: "lastName",
      headerName: "Last Name",
      width: 130,
    },
    {
      field: "organizationName",
      headerName: "Organization",
      width: 180,
    },
    {
      field: "paymentMethod",
      headerName: "Method",
      width: 130,
    },
    {
      field: "reference",
      headerName: "Reference",
      width: 160,
    },
    {
      field: "receivedAt",
      headerName: "Received At",
      width: 200,
      valueGetter: ({ value }) =>
        value
          ? new Date(value).toLocaleString("en-KE", {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : "N/A",
    },
    {
      field: "settledAt",
      headerName: "Settled On",
      width: 200,
      valueGetter: ({ value }) =>
        value
          ? new Date(value).toLocaleString("en-KE", {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : "N/A",
    },
    {
      field: "remarks",
      headerName: "Remarks",
      width: 200,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <TitleComponent title="Payment Confirmations" />

      {loading ? (
        <Box
          sx={{
            height: "50vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size={60} sx={{ color: theme.palette.greenAccent.main }} />
        </Box>
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id}
          paginationMode="client"
          paginationModel={pagination}
          onPaginationModelChange={setPagination}
          rowCount={rowCount}
          pageSizeOptions={[10, 20, 50]}
          disableSelectionOnClick
          autoHeight
          sx={{
            bgcolor: theme.palette.background.paper,
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: theme.palette.primary.main,
              color: theme.palette.grey[100],
            },
            "& .MuiDataGrid-cell": { color: theme.palette.grey[100] },
            my: 2,
          }}
          components={{
            Toolbar: () => (
              <GridToolbarContainer>
                <GridToolbarExport />
              </GridToolbarContainer>
            ),
          }}
        />
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
