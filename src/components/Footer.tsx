import { Box, Link, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const Footer = () => {
  const [version, setVersion] = useState<string | null>(null);
  useEffect(() => {
    const version = document.getElementById("js-version")?.textContent;
    if (version) {
      setVersion(version);
    }
  }, []);

  return (<Box
    component="footer"
    sx={{
      position: 'fixed',
      zIndex: 100,
      bottom: 0,
      width: '100%',
      bgcolor: "#eee",
      borderTop: '1px solid',
      borderColor: '#ddd',
      p: 1,
    }}>
    <Typography variant="body2">
      <Link sx={{ color: "#888", textDecoration: 'none' }} href="https://github.com/etkecc/synapse-admin" target="_blank">
        Synapse-Admin
      </Link> <Link href={`https://github.com/etkecc/synapse-admin/releases/tag/`+version} target="_blank">
        <span style={{ fontWeight: 'bold', color: "#000" }}>{version}</span>
      </Link> <Link sx={{ color: "#888", textDecoration: 'none' }} href="https://etke.cc/?utm_source=synapse-admin&utm_medium=footer&utm_campaign=synapse-admin" target="_blank">
        by etke.cc
      </Link> <Link sx={{ color: "#888", textDecoration: 'none' }} href="https://github.com/awesome-technologies/synapse-admin" target="_blank">
        (originally developed by Awesome Technologies Innovationslabor GmbH)
      </Link>
    </Typography>
  </Box>
  );
};

export default Footer;
