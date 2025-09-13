const nodemailer = require('nodemailer');
const twilio = require('twilio');

class NotificationService {
  constructor() {
    // Email transporter setup using Gmail
    this.emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
      }
    });

    // SMS client setup using Twilio
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && 
        process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
      this.smsClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    } else {
      console.warn('Warning: Twilio credentials not provided. SMS notifications will be disabled.');
      this.smsClient = null;
      this.twilioPhoneNumber = null;
    }
  }

  // Helper function to format phone numbers for international use
  formatPhoneNumber(phone) {
    if (!phone) return null;
    
    // Remove any spaces, dashes, or other formatting
    let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // If it starts with +, return as is
    if (cleanPhone.startsWith('+')) {
      return cleanPhone;
    }
    
    // If it starts with 91, add +
    if (cleanPhone.startsWith('91')) {
      return '+' + cleanPhone;
    }
    
    // If it's a 10-digit Indian number, add +91
    if (cleanPhone.length === 10 && cleanPhone.match(/^[6-9]\d{9}$/)) {
      return '+91' + cleanPhone;
    }
    
    // If it's an 11-digit number starting with 0, remove 0 and add +91
    if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
      return '+91' + cleanPhone.substring(1);
    }
    
    // Default: assume it's an Indian number and add +91
    return '+91' + cleanPhone;
  }

  // Send welcome email for new patient registration
  async sendWelcomeEmail(patientData) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER || 'AyurAhaar <noreply@ayurahaar.com>',
        to: patientData.email,
        subject: 'Welcome to AyurAhaar - Your Ayurvedic Wellness Journey Begins!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
            <div style="background: linear-gradient(135deg, #4A9D6A, #66B884); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to AyurAhaar!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your Ayurvedic Wellness Journey Begins Here</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #4A9D6A; margin-bottom: 20px;">Hello ${patientData.name}!</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Thank you for joining AyurAhaar, your trusted partner in holistic health and wellness. 
                We're excited to be part of your journey towards natural healing and balanced living.
              </p>
              
              <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #4A9D6A; margin-top: 0;">Your Account Details:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li style="margin: 8px 0;"><strong>Name:</strong> ${patientData.name}</li>
                  <li style="margin: 8px 0;"><strong>Email:</strong> ${patientData.email}</li>
                  <li style="margin: 8px 0;"><strong>Phone:</strong> ${patientData.phone || 'Not provided'}</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background: linear-gradient(135deg, #4A9D6A, #66B884); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Book Your First Consultation</a>
              </div>
              
              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px; color: #666; font-size: 14px;">
                <p><strong>What's Next?</strong></p>
                <ul>
                  <li>Complete your health survey for personalized recommendations</li>
                  <li>Browse our certified Ayurvedic doctors</li>
                  <li>Book your consultation at your convenience</li>
                  <li>Start your wellness journey with expert guidance</li>
                </ul>
              </div>
            </div>
          </div>
        `
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send welcome SMS for new patient registration
  async sendWelcomeSMS(patientData) {
    try {
      if (!this.smsClient) {
        console.log('SMS service not configured - skipping SMS');
        return { success: false, error: 'SMS service not configured' };
      }

      if (!patientData.phone) {
        console.log('No phone number provided for SMS');
        return { success: false, error: 'No phone number provided' };
      }

      const formattedPhone = this.formatPhoneNumber(patientData.phone);
      console.log('Sending SMS to formatted phone:', formattedPhone);

      const message = `Welcome to AyurAhaar, ${patientData.name}! 🌿 Your Ayurvedic wellness journey begins now. Book your first consultation with our certified doctors. Visit: ayurahaar.com`;

      const result = await this.smsClient.messages.create({
        body: message,
        from: this.twilioPhoneNumber,
        to: formattedPhone
      });

      console.log('Welcome SMS sent successfully:', result.sid);
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error('Error sending welcome SMS:', error);
      return { success: false, error: error.message };
    }
  }

  // Send appointment booking confirmation email
  async sendAppointmentBookingEmail(appointmentData) {
    try {
      const appointmentDate = new Date(appointmentData.date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const mailOptions = {
        from: process.env.EMAIL_USER || 'AyurAhaar <noreply@ayurahaar.com>',
        to: appointmentData.patientDetails.email,
        subject: `Appointment Confirmed - ${appointmentData.doctorName} on ${appointmentDate}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
            <div style="background: linear-gradient(135deg, #4A9D6A, #66B884); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">✅ Appointment Confirmed!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your wellness consultation is scheduled</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #4A9D6A; margin-bottom: 20px;">Hello ${appointmentData.patientDetails.name}!</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Your appointment has been successfully confirmed. Here are your appointment details:
              </p>
              
              <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #4A9D6A; margin-top: 0;">Appointment Details:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li style="margin: 8px 0;"><strong>Appointment ID:</strong> ${appointmentData.appointmentId}</li>
                  <li style="margin: 8px 0;"><strong>Doctor:</strong> ${appointmentData.doctorName}</li>
                  <li style="margin: 8px 0;"><strong>Specialization:</strong> ${appointmentData.doctorSpecialization}</li>
                  <li style="margin: 8px 0;"><strong>Date:</strong> ${appointmentDate}</li>
                  <li style="margin: 8px 0;"><strong>Time:</strong> ${appointmentData.time}</li>
                  <li style="margin: 8px 0;"><strong>Consultation Fee:</strong> ₹${appointmentData.consultationFee}</li>
                  <li style="margin: 8px 0;"><strong>Status:</strong> <span style="color: #4A9D6A; font-weight: bold;">Confirmed & Paid</span></li>
                </ul>
              </div>
              
              <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #4A9D6A; margin-top: 0;">Before Your Appointment:</h4>
                <ul style="color: #333; margin: 0;">
                  <li>Keep your medical history and current medications ready</li>
                  <li>Note down all symptoms and questions you want to discuss</li>
                  <li>Ensure a quiet environment for your consultation</li>
                  <li>Have a pen and paper ready for notes</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background: linear-gradient(135deg, #4A9D6A, #66B884); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin-right: 10px;">View Appointment</a>
                <a href="#" style="background: #f0f0f0; color: #333; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Reschedule</a>
              </div>
            </div>
          </div>
        `
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log('Appointment booking email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending appointment booking email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send appointment booking confirmation SMS
  async sendAppointmentBookingSMS(appointmentData) {
    try {
      if (!this.smsClient) {
        console.log('SMS service not configured - skipping SMS');
        return { success: false, error: 'SMS service not configured' };
      }

      if (!appointmentData.patientDetails.phone) {
        console.log('No phone number provided for appointment SMS');
        return { success: false, error: 'No phone number provided' };
      }

      const formattedPhone = this.formatPhoneNumber(appointmentData.patientDetails.phone);
      console.log('Sending appointment SMS to formatted phone:', formattedPhone);

      const appointmentDate = new Date(appointmentData.date).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric'
      });

      const message = `✅ Appointment Confirmed! 
Dr. ${appointmentData.doctorName}
📅 ${appointmentDate} at ${appointmentData.time}
💰 ₹${appointmentData.consultationFee} (Paid)
ID: ${appointmentData.appointmentId}
AyurAhaar wishes you good health! 🌿`;

      const result = await this.smsClient.messages.create({
        body: message,
        from: this.twilioPhoneNumber,
        to: formattedPhone
      });

      console.log('Appointment booking SMS sent successfully:', result.sid);
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error('Error sending appointment booking SMS:', error);
      return { success: false, error: error.message };
    }
  }

  // Send appointment cancellation email
  async sendAppointmentCancellationEmail(appointmentData) {
    try {
      const appointmentDate = new Date(appointmentData.date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const mailOptions = {
        from: process.env.EMAIL_USER || 'AyurAhaar <noreply@ayurahaar.com>',
        to: appointmentData.patientDetails.email,
        subject: `Appointment Cancelled - ${appointmentData.doctorName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ff6b6b, #ff8e8e); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">❌ Appointment Cancelled</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">We're sorry to see this cancellation</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #ff6b6b; margin-bottom: 20px;">Hello ${appointmentData.patientDetails.name}!</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Your appointment has been successfully cancelled. Here are the details of the cancelled appointment:
              </p>
              
              <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #ff6b6b; margin-top: 0;">Cancelled Appointment Details:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li style="margin: 8px 0;"><strong>Appointment ID:</strong> ${appointmentData.appointmentId}</li>
                  <li style="margin: 8px 0;"><strong>Doctor:</strong> ${appointmentData.doctorName}</li>
                  <li style="margin: 8px 0;"><strong>Date:</strong> ${appointmentDate}</li>
                  <li style="margin: 8px 0;"><strong>Time:</strong> ${appointmentData.time}</li>
                  <li style="margin: 8px 0;"><strong>Consultation Fee:</strong> ₹${appointmentData.consultationFee}</li>
                </ul>
              </div>
              
              <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #4A9D6A; margin-top: 0;">Refund Information:</h4>
                <p style="color: #333; margin: 0;">
                  Your refund of ₹${appointmentData.consultationFee} will be processed within 3-5 business days 
                  and credited to your original payment method.
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background: linear-gradient(135deg, #4A9D6A, #66B884); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Book New Appointment</a>
              </div>
            </div>
          </div>
        `
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log('Appointment cancellation email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending appointment cancellation email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send appointment cancellation SMS
  async sendAppointmentCancellationSMS(appointmentData) {
    try {
      if (!this.smsClient) {
        console.log('SMS service not configured - skipping SMS');
        return { success: false, error: 'SMS service not configured' };
      }

      if (!appointmentData.patientDetails.phone) {
        console.log('No phone number provided for cancellation SMS');
        return { success: false, error: 'No phone number provided' };
      }

      const formattedPhone = this.formatPhoneNumber(appointmentData.patientDetails.phone);
      console.log('Sending cancellation SMS to formatted phone:', formattedPhone);

      const appointmentDate = new Date(appointmentData.date).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric'
      });

      const message = `❌ Appointment Cancelled
Dr. ${appointmentData.doctorName}
📅 ${appointmentDate} at ${appointmentData.time}
💰 Refund of ₹${appointmentData.consultationFee} in 3-5 days
Book anytime: ayurahaar.com 🌿`;

      const result = await this.smsClient.messages.create({
        body: message,
        from: this.twilioPhoneNumber,
        to: formattedPhone
      });

      console.log('Appointment cancellation SMS sent successfully:', result.sid);
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error('Error sending appointment cancellation SMS:', error);
      return { success: false, error: error.message };
    }
  }

  // Send appointment reschedule email
  async sendAppointmentRescheduleEmail(appointmentData, oldDate, oldTime) {
    try {
      const newAppointmentDate = new Date(appointmentData.date).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const oldAppointmentDate = new Date(oldDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const mailOptions = {
        from: process.env.EMAIL_USER || 'AyurAhaar <noreply@ayurahaar.com>',
        to: appointmentData.patientDetails.email,
        subject: `Appointment Rescheduled - ${appointmentData.doctorName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
            <div style="background: linear-gradient(135deg, #ff8c42, #ffab71); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🔄 Appointment Rescheduled</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your appointment has been moved to a new time</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #ff8c42; margin-bottom: 20px;">Hello ${appointmentData.patientDetails.name}!</h2>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Your appointment has been successfully rescheduled. Here are your updated appointment details:
              </p>
              
              <div style="display: flex; gap: 20px; margin: 20px 0;">
                <div style="flex: 1; background: #ffebee; padding: 15px; border-radius: 8px;">
                  <h4 style="color: #d32f2f; margin-top: 0;">Previous Time:</h4>
                  <p style="margin: 0;"><strong>Date:</strong> ${oldAppointmentDate}</p>
                  <p style="margin: 5px 0 0 0;"><strong>Time:</strong> ${oldTime}</p>
                </div>
                <div style="flex: 1; background: #e8f5e8; padding: 15px; border-radius: 8px;">
                  <h4 style="color: #4A9D6A; margin-top: 0;">New Time:</h4>
                  <p style="margin: 0;"><strong>Date:</strong> ${newAppointmentDate}</p>
                  <p style="margin: 5px 0 0 0;"><strong>Time:</strong> ${appointmentData.time}</p>
                </div>
              </div>
              
              <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #ff8c42; margin-top: 0;">Updated Appointment Details:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li style="margin: 8px 0;"><strong>Appointment ID:</strong> ${appointmentData.appointmentId}</li>
                  <li style="margin: 8px 0;"><strong>Doctor:</strong> ${appointmentData.doctorName}</li>
                  <li style="margin: 8px 0;"><strong>Specialization:</strong> ${appointmentData.doctorSpecialization}</li>
                  <li style="margin: 8px 0;"><strong>Status:</strong> <span style="color: #ff8c42; font-weight: bold;">Pending Confirmation</span></li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background: linear-gradient(135deg, #4A9D6A, #66B884); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">View Updated Appointment</a>
              </div>
            </div>
          </div>
        `
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      console.log('Appointment reschedule email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending appointment reschedule email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send appointment reschedule SMS
  async sendAppointmentRescheduleSMS(appointmentData, oldDate, oldTime) {
    try {
      if (!this.smsClient) {
        console.log('SMS service not configured - skipping SMS');
        return { success: false, error: 'SMS service not configured' };
      }

      if (!appointmentData.patientDetails.phone) {
        console.log('No phone number provided for reschedule SMS');
        return { success: false, error: 'No phone number provided' };
      }

      const formattedPhone = this.formatPhoneNumber(appointmentData.patientDetails.phone);
      console.log('Sending reschedule SMS to formatted phone:', formattedPhone);

      const newAppointmentDate = new Date(appointmentData.date).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric'
      });

      const message = `🔄 Appointment Rescheduled
Dr. ${appointmentData.doctorName}
📅 NEW: ${newAppointmentDate} at ${appointmentData.time}
💰 ₹${appointmentData.consultationFee}
ID: ${appointmentData.appointmentId}
Status: Pending confirmation 🌿`;

      const result = await this.smsClient.messages.create({
        body: message,
        from: this.twilioPhoneNumber,
        to: formattedPhone
      });

      console.log('Appointment reschedule SMS sent successfully:', result.sid);
      return { success: true, sid: result.sid };
    } catch (error) {
      console.error('Error sending appointment reschedule SMS:', error);
      return { success: false, error: error.message };
    }
  }

  // Combined methods for easier use
  async sendRegistrationNotifications(patientData) {
    return {
      email: await this.sendWelcomeEmail(patientData),
      sms: await this.sendWelcomeSMS(patientData)
    };
  }

  async sendAppointmentBookingNotifications(appointmentData) {
    return {
      email: await this.sendAppointmentBookingEmail(appointmentData),
      sms: await this.sendAppointmentBookingSMS(appointmentData)
    };
  }

  async sendAppointmentCancellationNotifications(appointmentData) {
    return {
      email: await this.sendAppointmentCancellationEmail(appointmentData),
      sms: await this.sendAppointmentCancellationSMS(appointmentData)
    };
  }

  async sendAppointmentRescheduleNotifications(appointmentData, oldDate, oldTime) {
    return {
      email: await this.sendAppointmentRescheduleEmail(appointmentData, oldDate, oldTime),
      sms: await this.sendAppointmentRescheduleSMS(appointmentData, oldDate, oldTime)
    };
  }
}

module.exports = NotificationService;