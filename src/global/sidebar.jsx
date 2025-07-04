import { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  Dashboard,
  Receipt,
  Payment,
  BarChart,
  Settings,
  Person,
  ExpandLess,
  ExpandMore,
  Add,
  AttachMoney,
  Chat,
  Send,
  MonetizationOn,
  Assignment,
  ReceiptLong,
  Business,
  Water,
  
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import BusinessIcon from "@mui/icons-material/Business";

import HomeWorkIcon from '@mui/icons-material/HomeWork';

const Sidebar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true); // Controls sidebar collapse
  const [submenuOpen, setSubmenuOpen] = useState({
    customers: false,
    invoices: false,
    payments: false,
    communication: false,
    settings: false,
    reports: false,
    tasks: false,
    properties: false, // Added for Properties menu
  });

  // Toggle sidebar
  const toggleSidebar = () => setOpen(!open);

  // Toggle submenu
  const toggleSubmenu = (menu) => {
    setSubmenuOpen((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? 205 : 50,
        transition: "width 0.3s",
        "& .MuiDrawer-paper": {
          width: open ? 205 : 50,
          overflowX: "hidden",
        },
      }}
    >
      {/* Sidebar Toggle Button */}
      <IconButton onClick={toggleSidebar} sx={{ p: 1, mb: 1 }}>
        <MenuIcon sx={{ fontSize: 24 }} />
      </IconButton>

      <List sx={{ p: 0 }}>
        {/* Dashboard */}
        <ListItem button onClick={() => navigate("/")} sx={{ py: 1 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Dashboard sx={{ fontSize: 24 }} />
          </ListItemIcon>
          {open && <ListItemText primary="Dashboard" sx={{ fontSize: "0.9rem" }} />}
        </ListItem>

        {/* Customers Menu */}
        <ListItem button onClick={() => toggleSubmenu("customers")} sx={{ py: 1 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Person sx={{ fontSize: 24 }} />
          </ListItemIcon>
          {open && <ListItemText primary="Customers" sx={{ fontSize: "0.9rem" }} />}
          {open && (submenuOpen.customers ? <ExpandLess /> : <ExpandMore />)}
        </ListItem>
        <Collapse in={submenuOpen.customers} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button sx={{ pl: 3, py: 0.5 }} onClick={() => navigate("/customers")}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <Person sx={{ fontSize: 20 }} />
              </ListItemIcon>
              {open && <ListItemText primary="View" sx={{ fontSize: "0.8rem" }} />}
            </ListItem>
            <ListItem button sx={{ pl: 3, py: 0.5 }} onClick={() => navigate("/add-customer")}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <Add sx={{ fontSize: 20 }} />
              </ListItemIcon>
              {open && <ListItemText primary="Create" sx={{ fontSize: "0.8rem" }} />}
            </ListItem>
           
          </List>
        </Collapse>




       {/* Organizations Menu */}

{/* Organizations Menu */}
<ListItem button onClick={() => toggleSubmenu("properties")} sx={{ py: 1 }}>
  <ListItemIcon sx={{ minWidth: 40 }}>
    <Business sx={{ fontSize: 24 }} />
  </ListItemIcon>
  {open && <ListItemText primary="Organizations" sx={{ fontSize: "0.9rem" }} />}
  {open && (submenuOpen.properties ? <ExpandLess /> : <ExpandMore />)}
</ListItem>

<Collapse in={submenuOpen.properties} timeout="auto" unmountOnExit>
  <List component="div" disablePadding>
    {/* Create Organization */}
    <ListItem button sx={{ pl: 3, py: 0.5 }} onClick={() => navigate("/create-organization")}>
      <ListItemIcon sx={{ minWidth: 30 }}>
        <Add sx={{ fontSize: 20 }} />
      </ListItemIcon>
      {open && <ListItemText primary="Create Organization" sx={{ fontSize: "0.8rem" }} />}
    </ListItem>

    {/* Create Org Admin */}
  

    {/* View Organizations */}
    <ListItem button sx={{ pl: 3, py: 0.5 }} onClick={() => navigate("/organizations")}>
      <ListItemIcon sx={{ minWidth: 30 }}>
        <Business sx={{ fontSize: 20 }} />
      </ListItemIcon>
      {open && <ListItemText primary="All Organizations" sx={{ fontSize: "0.8rem" }} />}
    </ListItem>
   

    {/* View Org Admins */}
    <ListItem button sx={{ pl: 3, py: 0.5 }} onClick={() => navigate("/org-admins")}>
      <ListItemIcon sx={{ minWidth: 30 }}>
        <HomeWorkIcon sx={{ fontSize: 20 }} />
      </ListItemIcon>
      {open && <ListItemText primary="Org Admins" sx={{ fontSize: "0.8rem" }} />}
    </ListItem>

       <ListItem button sx={{ pl: 3, py: 0.5 }} onClick={() => navigate("/org-admins/create")}>
      <ListItemIcon sx={{ minWidth: 30 }}>
        <Add sx={{ fontSize: 20 }} />
      </ListItemIcon>
      {open && <ListItemText primary="Create Org Admin" sx={{ fontSize: "0.8rem" }} />}
    </ListItem>
  </List>
</Collapse>







        {/* Loans Menu */}
<ListItem button onClick={() => toggleSubmenu("loans")} sx={{ py: 1 }}>
  <ListItemIcon sx={{ minWidth: 40 }}>
    <Receipt sx={{ fontSize: 24 }} />
  </ListItemIcon>
  {open && <ListItemText primary="Loans" sx={{ fontSize: "0.9rem" }} />}
  {open && (submenuOpen.loans ? <ExpandLess /> : <ExpandMore />)}
</ListItem>

<Collapse in={submenuOpen.loans} timeout="auto" unmountOnExit>
  <List component="div" disablePadding>
    <ListItem button sx={{ pl: 3, py: 0.5 }} onClick={() => navigate("/loan-requests")}>
      <ListItemIcon sx={{ minWidth: 30 }}>
        <Receipt sx={{ fontSize: 20 }} />
      </ListItemIcon>
      {open && <ListItemText primary="Loan Requests" sx={{ fontSize: "0.8rem" }} />}
    </ListItem>
    <ListItem button sx={{ pl: 3, py: 0.5 }} onClick={() => navigate("/loans")}>
      <ListItemIcon sx={{ minWidth: 30 }}>
        <Receipt sx={{ fontSize: 20 }} />
      </ListItemIcon>
      {open && <ListItemText primary="All Loans" sx={{ fontSize: "0.8rem" }} />}
    </ListItem>
  </List>
</Collapse>




        {/* Payments Menu */}
        <ListItem button onClick={() => toggleSubmenu("payments")} sx={{ py: 1 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Payment sx={{ fontSize: 24 }} />
          </ListItemIcon>
          {open && <ListItemText primary="Payments" sx={{ fontSize: "0.9rem" }} />}
          {open && (submenuOpen.payments ? <ExpandLess /> : <ExpandMore />)}
        </ListItem>
        <Collapse in={submenuOpen.payments} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>

            <ListItem button sx={{ pl: 3, py: 0.5 }} onClick={() => navigate("/payments")}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <Payment sx={{ fontSize: 20 }} />
              </ListItemIcon>
              {open && <ListItemText primary="Pay outs" sx={{ fontSize: "0.8rem" }} />}
            </ListItem>
             <ListItem button sx={{ pl: 3, py: 0.5 }} onClick={() => navigate("/payments-in")}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <Payment sx={{ fontSize: 20 }} />
              </ListItemIcon>
              {open && <ListItemText primary="Pay ins" sx={{ fontSize: "0.8rem" }} />}
            </ListItem>

              <ListItem button sx={{ pl: 3, py: 0.5 }} onClick={() => navigate("/payments-batches")}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <Payment sx={{ fontSize: 20 }} />
              </ListItemIcon>
              {open && <ListItemText primary="Payment Batches" sx={{ fontSize: "0.8rem" }} />}
            </ListItem>
            <ListItem button sx={{ pl: 3, py: 0.5 }} onClick={() => navigate("/add-payment")}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <AttachMoney sx={{ fontSize: 20 }} />
              </ListItemIcon>
              {open && <ListItemText primary="Create" sx={{ fontSize: "0.8rem" }} />}
            </ListItem>
          
          </List>
        </Collapse>


        

        {/* Communication Center */}
        <ListItem button onClick={() => toggleSubmenu("communication")} sx={{ py: 1 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Chat sx={{ fontSize: 24 }} />
          </ListItemIcon>
          {open && <ListItemText primary="Communication" sx={{ fontSize: "0.9rem" }} />}
          {open && (submenuOpen.communication ? <ExpandLess /> : <ExpandMore />)}
        </ListItem>
        <Collapse in={submenuOpen.communication} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button sx={{ pl: 3, py: 0.5 }} onClick={() => navigate("/sent-sms")}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <Chat sx={{ fontSize: 20 }} />
              </ListItemIcon>
              {open && <ListItemText primary="Sent SMS" sx={{ fontSize: "0.8rem" }} />}
            </ListItem>
            <ListItem button sx={{ pl: 3, py: 0.5 }} onClick={() => navigate("/send-sms")}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <Send sx={{ fontSize: 20 }} />
              </ListItemIcon>
              {open && <ListItemText primary="Send SMS" sx={{ fontSize: "0.8rem" }} />}
            </ListItem>
            <ListItem button sx={{ pl: 3, py: 0.5 }} onClick={() => navigate("/send-bills")}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <Receipt sx={{ fontSize: 20 }} />
              </ListItemIcon>
              {open && <ListItemText primary="Send Bills" sx={{ fontSize: "0.8rem" }} />}
            </ListItem>
            <ListItem button sx={{ pl: 3, py: 0.5 }} onClick={() => navigate("/debt-management")}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <MonetizationOn sx={{ fontSize: 20 }} />
              </ListItemIcon>
              {open && <ListItemText primary="Debt Mgmt" sx={{ fontSize: "0.8rem" }} />}
            </ListItem>
          </List>
        </Collapse>





        {/* Reports */}
        <ListItem button onClick={() => toggleSubmenu("reports")} sx={{ py: 1 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <BarChart sx={{ fontSize: 24 }} />
          </ListItemIcon>
          {open && <ListItemText primary="Reports" sx={{ fontSize: "0.9rem" }} />}
          {open && (submenuOpen.reports ? <ExpandLess /> : <ExpandMore />)}
        </ListItem>
        <Collapse in={submenuOpen.reports} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button sx={{ pl: 3, py: 0.5 }} onClick={() => navigate("/view-reports")}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <Assignment sx={{ fontSize: 20 }} />
              </ListItemIcon>
              {open && <ListItemText primary="View" sx={{ fontSize: "0.8rem" }} />}
            </ListItem>
            <ListItem button sx={{ pl: 3, py: 0.5 }} onClick={() => navigate("/request-custom-reports")}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <Assignment sx={{ fontSize: 20 }} />
              </ListItemIcon>
              {open && <ListItemText primary="Custom" sx={{ fontSize: "0.8rem" }} />}
            </ListItem>
          </List>
        </Collapse>

        {/* Settings */}
        <ListItem button onClick={() => toggleSubmenu("settings")} sx={{ py: 1 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Settings sx={{ fontSize: 24 }} />
          </ListItemIcon>
          {open && <ListItemText primary="Settings" sx={{ fontSize: "0.9rem" }} />}
          {open && (submenuOpen.settings ? <ExpandLess /> : <ExpandMore />)}
        </ListItem>
        <Collapse in={submenuOpen.settings} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button sx={{ pl: 3, py: 0.5 }} onClick={() => navigate("/users")}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <Person sx={{ fontSize: 20 }} />
              </ListItemIcon>
              {open && <ListItemText primary="Users" sx={{ fontSize: "0.8rem" }} />}
            </ListItem>
            <ListItem button sx={{ pl: 3, py: 0.5 }} onClick={() => navigate("/org-details")}>
              <ListItemIcon sx={{ minWidth: 30 }}>
                <BusinessIcon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              {open && <ListItemText primary="Org details" sx={{ fontSize: "0.8rem" }} />}
            </ListItem>
          </List>
        </Collapse>
      </List>
    </Drawer>
  );
};

export default Sidebar;