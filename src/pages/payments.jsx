

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

import VisibilityIcon from "@mui/icons-material/Visibility";
import { Link } from "react-router-dom";
import IconButton from "@mui/material/IconButton";


const flattenPayouts = (payouts) => {
  return payouts.map((payout) => ({
    id: payout.id,
    loanId: payout.loanId,
    amount: payout.amount,
    method: payout.method,
    status: payout.status,
    transactionId: payout.transactionId || "N/A",
    createdAt: payout.createdAt,
    customerName: `${payout.loan?.user?.firstName || ""} ${payout.loan?.user?.lastName || ""}`,
    organizationName: payout.loan?.organization?.name || "N/A",
  }));
};

const Payments = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [error, setError] = useState(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);

  const currentUser = useAuthStore((state) => state.currentUser);
  const BASEURL = import.meta.env.VITE_BASE_URL;
  const theme = getTheme();

  useEffect(() => {
    if (currentUser) fetchPayouts();
  }, [currentUser]);


  const fetchPayouts = async () => {
  setLoading(true);
  setError(null);
  try {
    const response = await axios.get(`${BASEURL}/loan-payouts`, {
      withCredentials: true,
    });
    const fetched = response.data.data; // fixed line
    console.log(`fetched payouts: ${JSON.stringify(fetched, null, 2)}`);
    const flattened = flattenPayouts(fetched || []);
    setPayouts(flattened);
    setRowCount(flattened.length);
  } catch (err) {
    setError("Failed to fetch payouts.");
    setOpenSnackbar(true);
    setPayouts([]);
    setRowCount(0);
  } finally {
    setLoading(false);
  }
};


  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setError(null);
  };



  const columns = [
  {
    field: "view",
    headerName: "View",
    width: 100,
    renderCell: (params) => (
      <IconButton
        component={Link}
        to={`/payouts/${params.row.id}`}
        sx={{ color: theme.palette.greenAccent.main }}
      >
        <VisibilityIcon />
      </IconButton>
    ),
  },
  { field: "id", headerName: "Payout ID", width: 100 },
  { field: "amount", headerName: "Amount (KES)", width: 150 },
  { field: "method", headerName: "Payment Method", width: 150 },
  { field: "status", headerName: "Status", width: 130 },
  { field: "transactionId", headerName: "Transaction ID", width: 200 },
  { field: "customerName", headerName: "Customer", width: 180 },
  { field: "organizationName", headerName: "Organization", width: 180 },
  {
    field: "createdAt",
    headerName: "Date",
    width: 200,
    valueGetter: (params) =>
      new Date(params.value).toLocaleString("en-KE", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
  },
];

  return (
    <Box sx={{ p: 3 }}>
      <TitleComponent title="Loan Payouts" />
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
          <CircularProgress size={70} sx={{ color: theme.palette.greenAccent.main }} />
        </Box>
      ) : (
        <DataGrid
          rows={payouts}
          columns={columns}
          getRowId={(row) => row.id}
          paginationMode="client"
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50]}
          disableSelectionOnClick
          sx={{
            bgcolor: theme.palette.background.paper,
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: theme.palette.primary.main,
              color: theme.palette.grey[100],
            },
            "& .MuiDataGrid-cell": { color: theme.palette.grey[100] },
            ml: "auto",
            mr: "auto",
            maxWidth: "100%",
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

      {!loading && (
        <Typography sx={{ textAlign: "center", mt: 2, color: theme.palette.grey[100] }}>
          Page {paginationModel.page + 1} of {Math.ceil(rowCount / paginationModel.pageSize) || 1}
        </Typography>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Payments;
