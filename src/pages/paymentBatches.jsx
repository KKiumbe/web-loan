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

export default function PaymentBatches() {
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
    if (currentUser) fetchBatches(pagination.page, pagination.pageSize);
  }, [currentUser]);

 

  const fetchBatches = async (page, limit) => {
  setLoading(true);
  try {
    const res = await axios.get(
      `${BASE_URL}/payment-batches`,
      { params: { page: page + 1, limit }, withCredentials: true }
    );
    const { batches, total } = res.data;
    setRows(batches);
    setRowCount(total);
  } catch (err) {
    console.error(err);
    setError(
      err.response?.status === 403
        ? "Forbidden — you don’t have permission to view payment batches."
        : "Failed to load payment batches."
    );
    setOpenSnackbar(true);
  } finally {
    setLoading(false);
  }
};


  const handlePageChange = (newPg) => {
    setPagination((p) => ({ ...p, page: newPg }));
    fetchBatches(newPg, pagination.pageSize);
  };
  const handlePageSizeChange = (newSize) => {
    setPagination({ page: 0, pageSize: newSize });
    fetchBatches(0, newSize);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError("");
  };

  const columns = [
    { field: "id", headerName: "Batch ID", width: 100 },
    {
      field: "organizationName",
      headerName: "Organization",
      width: 180,
    },
    {
      field: "totalAmount",
      headerName: "Total (KES)",
      width: 140,
      type: "number",
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
      field: "confirmationCount",
      headerName: "# Confirmations",
      width: 140,
      type: "number",
    },
    {
      field: "receivedAt",
      headerName: "Received On",
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
      <TitleComponent title="Payment Batches" />

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
          paginationMode="server"
          paginationModel={pagination}
          rowCount={rowCount}
          onPaginationModelChange={({ page, pageSize }) => {
            if (page !== pagination.page) handlePageChange(page);
            if (pageSize !== pagination.pageSize) handlePageSizeChange(pageSize);
          }}
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
