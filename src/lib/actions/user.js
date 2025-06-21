import User from '../models/user.model';

import { connect } from '../mongodb/mongoose';

export const createOrUpdateUser = async (
  id,
  first_name,
  last_name,
  image_url,
  email_addresses,
  username
) => {
  try {
    await connect();
    console.log('Connected to MongoDB, creating/updating user with data:', {
      clerkId: id,
      firstName: first_name,
      lastName: last_name,
      email: email_addresses?.[0]?.email_address,
      username
    });
    
    // First, try to find a user with the same email
    const existingUser = await User.findOne({ email: email_addresses[0].email_address });
    
    if (existingUser) {
      console.log('Found existing user with same email:', existingUser);
      
      // If the existing user has a different clerkId, update it
      if (existingUser.clerkId !== id) {
        console.log('Updating existing user with new clerkId');
        const updatedUser = await User.findByIdAndUpdate(
          existingUser._id,
          {
            $set: {
              clerkId: id,
              firstName: first_name,
              lastName: last_name,
              profilePicture: image_url,
              username,
            },
          },
          { new: true }
        );
        console.log('User updated successfully:', updatedUser);
        return updatedUser;
      } else {
        // Same clerkId, just update the user info
        console.log('Updating existing user info');
        const updatedUser = await User.findByIdAndUpdate(
          existingUser._id,
          {
            $set: {
              firstName: first_name,
              lastName: last_name,
              profilePicture: image_url,
              username,
            },
          },
          { new: true }
        );
        console.log('User updated successfully:', updatedUser);
        return updatedUser;
      }
    }
    
    // No existing user found, create new one
    console.log('Creating new user');
    const user = await User.findOneAndUpdate(
      { clerkId: id },
      {
        $set: {
          firstName: first_name,
          lastName: last_name,
          profilePicture: image_url,
          email: email_addresses[0].email_address,
          username,
        },
      },
      { new: true, upsert: true }
    );
    
    console.log('User successfully created/updated:', user);
    return user;
  } catch (error) {
    console.log('Error creating or updating user:', error);
    throw error; // Re-throw the error so the webhook can handle it
  }
};

export const deleteUser = async (id) => {
  try {
    await connect();
    await User.findOneAndDelete({ clerkId: id });
  } catch (error) {
    console.log('Error deleting user:', error);
  }
};
