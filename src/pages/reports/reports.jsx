import { useState, useEffect } from 'react';
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  LinearProgress,
  Snackbar,
  Alert,
  Container,
  Autocomplete,
  TextField,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { getTheme } from '../../store/theme';
import TitleComponent from '../../components/title';
import { format } from 'date-fns';

const BASEURL = import.meta.env.VITE_BASE_URL;

const ReportScreen = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [downloading, setDownloading] = useState({});
  const [progress, setProgress] = useState({});
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [organizations, setOrganizations] = useState([]);
  const [orgLoading, setOrgLoading] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null); // Track selected report

  const currentUser = useAuthStore((state) => state.currentUser);
  const navigate = useNavigate();
  const theme = getTheme();

  // Fetch organizations on mount
  const fetchOrganizations = async () => {
    setOrgLoading(true);
    try {
      const res = await axios.get(`${BASEURL}/organizations`, { withCredentials: true });
      const orgs = res.data || [];
      console.log('Organizations:', orgs);
      setOrganizations(orgs);
      if (orgs.length === 1) {
        setSelectedOrg(orgs[0]);
      }
    } catch (err) {
      console.error('Failed to load organizations:', err);
      setNotification({ open: true, message: 'Failed to load organizations', severity: 'error' });
      setOrganizations([]);
    } finally {
      setOrgLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else {
      fetchOrganizations();
    }
  }, [currentUser, navigate]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedReport(null); // Reset selected report when switching tabs
    setSelectedOrg(null); // Reset selected organization
  };

  const reportData = {
    customers: [
      {
        name: 'All Employees',
        description: 'List of all Employees per org',
        endpoint: `${BASEURL}/employees-per-org`,
        method: 'get',
      },
    ],
    loans: [
      {
        name: 'Loans per Organisation',
        description: 'Loans per organisation',
        endpoint: `${BASEURL}/loans-per-org`,
        method: 'post',
        requiresBody: true,
        requiresOrg: false,
      },
      {
        name: 'Loans Summary per Organisation',
        description: 'Loans Summary per organisation',
        endpoint: `${BASEURL}/loan-summary-per-org`,
        method: 'post',
        requiresBody: true,
        requiresOrg: false,
      },
      {
        name: 'Loans for Specific Organisation',
        description: 'Loans for a specific organisation grouped by loanee',
        endpoint: `${BASEURL}/loans-per-one-org`,
        method: 'post',
        requiresBody: true,
        requiresOrg: true,
      },
    ],
  };

  const handleDownload = async (report) => {
    const { endpoint, name, method, requiresBody, requiresOrg } = report;

    if (requiresBody && !selectedDate) {
      setNotification({
        open: true,
        message: 'Please select a month first',
        severity: 'error',
      });
      return;
    }
    if (requiresOrg && !selectedOrg) {
      setNotification({
        open: true,
        message: 'Please select an organization first',
        severity: 'error',
      });
      return;
    }

    const formattedMonth = selectedDate ? format(selectedDate, 'yyyy-MM') : '';

    setDownloading((prev) => ({ ...prev, [endpoint]: true }));
    setProgress((prev) => ({ ...prev, [endpoint]: 0 }));

    try {
      const config = {
        responseType: 'blob',
        withCredentials: true,
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress((prev) => ({ ...prev, [endpoint]: percentCompleted }));
        },
      };

      // Prepare request body
      const requestBody = requiresBody
        ? { month: formattedMonth, ...(requiresOrg ? { orgId: selectedOrg.id } : {}) }
        : undefined;

      const response = await axios({
        method,
        url: endpoint,
        data: requestBody,
        ...config,
      });

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute(
        'download',
        `${name.toLowerCase().replace(/\s+/g, '-')}${requiresOrg ? `-${selectedOrg.name}` : ''}-${formattedMonth}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      setNotification({
        open: true,
        message: `${name} downloaded successfully!`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      setNotification({
        open: true,
        message: error.response?.data?.message || 'Failed to download report',
        severity: 'error',
      });
    } finally {
      setDownloading((prev) => ({ ...prev, [endpoint]: false }));
      setProgress((prev) => ({ ...prev, [endpoint]: 0 }));
    }
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const renderTabContent = (tabData) => {
    if (!tabData || !Array.isArray(tabData)) {
      return <Typography>No reports available for this category.</Typography>;
    }

    return (
      <>
        {activeTab === 1 && (
          <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                views={['year', 'month']}
                label="Select Month"
                minDate={new Date('2022-01-01')}
                maxDate={new Date('2026-12-31')}
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                slotProps={{ textField: { variant: 'outlined', sx: { mr: 2 } } }}
              />
            </LocalizationProvider>
            {selectedReport?.requiresOrg && (
              <Autocomplete
                options={organizations}
                getOptionLabel={(option) => option.name || ''}
                loading={orgLoading}
                value={selectedOrg}
                onChange={(event, newValue) => setSelectedOrg(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Organization"
                    variant="outlined"
                    sx={{ width: 300 }}
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
              />
            )}
          </Box>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Report Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tabData.map((report, index) => (
                <TableRow key={index}>
                  <TableCell>{report.name}</TableCell>
                  <TableCell>{report.description}</TableCell>
                  <TableCell>
                    <Box sx={{ position: 'relative' }}>
                      <Button
                        variant="contained"
                        sx={{ backgroundColor: theme.palette.greenAccent.main }}
                        onClick={() => {
                          setSelectedReport(report); // Set selected report
                          handleDownload(report);
                        }}
                        disabled={downloading[report.endpoint]}
                      >
                        {downloading[report.endpoint] ? 'Downloading...' : 'Download'}
                      </Button>
                      {downloading[report.endpoint] && (
                        <LinearProgress
                          variant="determinate"
                          value={progress[report.endpoint] || 0}
                          sx={{ position: 'absolute', bottom: -4, left: 0, right: 0 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  };

  return (
    <Container sx={{ width: '100%', ml: 20 }}>
      <Box>
        <Typography variant="h5" gutterBottom>
          <TitleComponent title="Reports Center" />
        </Typography>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="report tabs"
          sx={{
            minWidth: 500,
            maxWidth: 1200,
            width: '100%',
            color: theme.palette.primary.contrastText,
            mb: 3,
            border: `1px solid ${theme.palette.primary.light}`,
            borderRadius: 2,
            '& .MuiTab-root': { color: theme.palette.primary.contrastText },
            '& .Mui-selected': { backgroundColor: theme.palette.greenAccent.main },
          }}
        >
          <Tab label="Employees" />
          <Tab label="Loans" />
        </Tabs>
        <Box sx={{ mt: 2 }}>
          {activeTab === 0 && renderTabContent(reportData.customers)}
          {activeTab === 1 && renderTabContent(reportData.loans)}
        </Box>
      </Box>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ReportScreen;