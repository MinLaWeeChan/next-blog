// app/api/webhooks/route.js
import { createOrUpdateUser, deleteUser } from '@/lib/actions/user'
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { clerkClient } from '@clerk/backend'

export async function POST(req) {
  try {
    console.log('=== WEBHOOK START ===');
    console.log('Webhook received, attempting to verify...');
    
    // Check environment variables
    console.log('Environment check:', {
      hasMongoUri: !!process.env.MONGODB_URI,
      hasClerkSecret: !!process.env.CLERK_WEBHOOK_SECRET,
      hasClerkPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      hasClerkSecretKey: !!process.env.CLERK_SECRET_KEY
    });
    
    const evt = await verifyWebhook(req)
    console.log('Webhook verified successfully');
    console.log('Event type:', evt?.type);
    console.log('Event data:', evt?.data);

    // For now, just log the event and return success
    const { id } = evt?.data
    const eventType = evt?.type
    console.log(`Received webhook with ID ${id} and event type of ${eventType}`)

    // Only process user.created events for now
    if (eventType === 'user.created') {
      console.log('Processing user.created event...');
      
      const { id, first_name, last_name, image_url, email_addresses, username } = evt?.data;
      console.log('User data extracted:', { id, first_name, last_name, username, email: email_addresses?.[0]?.email_address });
      
      try {
        console.log('Calling createOrUpdateUser...');
        const user = await createOrUpdateUser(
          id,
          first_name,
          last_name,
          image_url,
          email_addresses,
          username
        );
        console.log('createOrUpdateUser result:', user);
        
        if (user) {
          console.log('User created successfully, updating Clerk metadata...');
          console.log('clerkClient available:', !!clerkClient);
          console.log('clerkClient.users available:', !!clerkClient?.users);
          try {
            // Use direct API call instead of clerkClient
            const response = await fetch(`https://api.clerk.com/v1/users/${id}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                public_metadata: {
                  userMongoId: user._id,
                  isAdmin: user.isAdmin,
                },
              }),
            });
            
            if (response.ok) {
              const updatedUser = await response.json();
              console.log('Clerk metadata updated successfully:', updatedUser);
            } else {
              const errorData = await response.text();
              console.log('Error response from Clerk API:', response.status, errorData);
            }
          } catch (error) {
            console.log('Error updating Clerk metadata:', error);
          }
        } else {
          console.log('User creation returned null/undefined');
        }
      } catch (error) {
        console.log('Error in user creation process:', error);
        return new Response('Error creating user', { status: 400 });
      }
    }

    console.log('=== WEBHOOK END ===');
    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('=== WEBHOOK ERROR ===');
    console.error('Error in webhook processing:', err);
    console.error('Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    return new Response('Error verifying webhook', { status: 400 })
  }
}

export async function GET() {
  return new Response('Webhook endpoint is working', { status: 200 })
}

