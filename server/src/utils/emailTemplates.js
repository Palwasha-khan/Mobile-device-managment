export const approvalEmailTemplate = (employeeName) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px;">
    <h2 style="color: #16a34a;">Account Approved</h2>
    <p>Hi ${employeeName},</p>
    <p>Your account has been approved by your IT administrator. You can now log in to the MDM app with your registered email and password.</p>
    <p style="color: #666; font-size: 13px;">If you weren't expecting this, please contact IT.</p>
  </div>
`;

export const rejectionEmailTemplate = (employeeName) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px;">
    <h2 style="color: #dc2626;">Registration Declined</h2>
    <p>Hi ${employeeName},</p>
    <p>Your registration request was not approved at this time. If you believe this is a mistake, please contact your IT administrator.</p>
  </div>
`;