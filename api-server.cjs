const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Invite User
app.post('/api/invite-user', async (req, res) => {
  try {
    const { email, password, role, organization, position, invited_by } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        invited_by,
        needs_password_change: true
      },
    });
    if (authError) {
      return res.status(500).json({ error: authError.message });
    }
    if (authData.user) {
      await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email,
          role,
          organization: organization || null,
          position: position || null,
          invited_by: invited_by || null,
          created_at: new Date().toISOString()
        });
    }
    return res.status(200).json({ success: true, user: authData.user });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

// List Invitations
app.get('/api/list-invitations', async (req, res) => {
  try {
    const { data, error } = await supabase.from('invitations').select('*');
    if (error) {
      return res.status(500).json({ invitations: [], error: error.message });
    }
    return res.status(200).json({ invitations: data });
  } catch (error) {
    return res.status(500).json({ invitations: [], error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

// List Profiles
app.get('/api/list-profiles', async (req, res) => {
  try {
    const { data, error } = await supabase.from('profiles').select('email');
    if (error) {
      return res.status(500).json({ profiles: [], error: error.message });
    }
    return res.status(200).json({ profiles: data });
  } catch (error) {
    return res.status(500).json({ profiles: [], error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

// Delete Invitation
app.post('/api/delete-invitation', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Invitation ID is required' });
    }
    const { error } = await supabase.from('invitations').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

// Delete Profile
app.post('/api/delete-profile', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Profile ID is required' });
    }
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

// Delete Auth User
app.post('/api/delete-auth-user', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

// Send Password Reset
app.post('/api/send-password-reset', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const { error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
    });
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

// Update User Password (Admin)
app.post('/api/update-user-password', async (req, res) => {
  try {
    const { id, password } = req.body;
    console.log('Received password update request:', { id, password });
    if (!id || !password) {
      console.log('Missing id or password');
      return res.status(400).json({ error: 'User ID and new password are required' });
    }
    const { error } = await supabase.auth.admin.updateUserById(id, { password });
    if (error) {
      console.error('Supabase error updating password:', error);
      return res.status(500).json({ error: error.message });
    }
    console.log('Password updated successfully for user:', id);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('API error updating password:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
}); 