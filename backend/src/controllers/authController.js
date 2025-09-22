const admin = require('../config/firebase');
const { User, Entrepreneur, Ally, Client } = require('../models');

class AuthController {
  async register(req, res) {
    try {
      const { token, role, additionalData } = req.body;

      if (!token || !role) {
        return res.status(400).json({ error: 'Token and role are required' });
      }

      const decodedToken = await admin.auth().verifyIdToken(token);
      const { uid, email, name, picture } = decodedToken;

      let existingUser = await User.findOne({ where: { firebaseUid: uid } });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const userData = {
        firebaseUid: uid,
        email: email,
        name: name || email.split('@')[0],
        role: role,
        profilePicture: picture,
        lastLogin: new Date()
      };

      const user = await User.create(userData);

      switch (role) {
        case 'entrepreneur':
          await Entrepreneur.create({
            userId: user.id,
            personalInfo: additionalData?.personalInfo || {},
            isVulnerablePopulation: additionalData?.isVulnerablePopulation || false
          });
          break;
        case 'ally':
          await Ally.create({
            userId: user.id,
            specialization: additionalData?.specialization || '',
            experience: additionalData?.experience || '',
            expertise: additionalData?.expertise || []
          });
          break;
        case 'client':
          await Client.create({
            userId: user.id,
            organization: additionalData?.organization || '',
            sector: additionalData?.sector || '',
            interests: additionalData?.interests || []
          });
          break;
      }

      const userWithProfile = await User.findOne({
        where: { id: user.id },
        include: ['entrepreneur', 'ally', 'client']
      });

      res.status(201).json({
        message: 'User registered successfully',
        user: userWithProfile
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  async login(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Token is required' });
      }

      const decodedToken = await admin.auth().verifyIdToken(token);
      const user = await User.findOne({
        where: { firebaseUid: decodedToken.uid },
        include: ['entrepreneur', 'ally', 'client']
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: 'Account is inactive' });
      }

      await user.update({ lastLogin: new Date() });

      res.json({
        message: 'Login successful',
        user: user
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await User.findOne({
        where: { id: req.user.id },
        include: ['entrepreneur', 'ally', 'client']
      });

      res.json({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  async updateProfile(req, res) {
    try {
      const { name, profilePicture, additionalData } = req.body;
      const user = req.user;

      const updateData = {};
      if (name) updateData.name = name;
      if (profilePicture) updateData.profilePicture = profilePicture;

      await user.update(updateData);

      if (additionalData) {
        switch (user.role) {
          case 'entrepreneur':
            if (user.entrepreneur) {
              await user.entrepreneur.update(additionalData);
            }
            break;
          case 'ally':
            if (user.ally) {
              await user.ally.update(additionalData);
            }
            break;
          case 'client':
            if (user.client) {
              await user.client.update(additionalData);
            }
            break;
        }
      }

      const updatedUser = await User.findOne({
        where: { id: user.id },
        include: ['entrepreneur', 'ally', 'client']
      });

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
}

module.exports = new AuthController();