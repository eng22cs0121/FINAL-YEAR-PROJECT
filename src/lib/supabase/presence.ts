import { createClient } from './client';

/**
 * Updates the 'last_active' timestamp for the current user
 * This helps regulators see which administrators or stakeholders are currently online
 */
export async function syncUserActivity(userId: string, role: string, accessToken?: string) {
    const supabase = createClient();
    const now = new Date().toISOString();

    // 1. If it's an admin, update the admin_users table
    if (role === 'admin') {
        try {
            if (accessToken) {
                await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/admin_users?id=eq.${userId}`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ last_active: now })
                });
            } else {
                await supabase
                    .from('admin_users')
                    .update({ last_active: now })
                    .eq('id', userId);
            }
        } catch (e) {
            console.error('[Presence] Failed to sync admin activity:', e);
        }
    }

    // 2. For stakeholders, update the metadata with presence info
    if (['manufacturer', 'distributor', 'pharmacy', 'regulator', 'logistics'].includes(role)) {
        try {
            // We update the stakeholders table for this user_id
            const { data: stakeholder } = await supabase
                .from('stakeholders')
                .select('id, metadata')
                .eq('user_id', userId)
                .maybeSingle();

            if (stakeholder) {
                const updatedMetadata = {
                    ...(stakeholder.metadata as object || {}),
                    lastActive: now,
                    lastSessionId: typeof window !== 'undefined' ? sessionStorage.getItem('sessionId') : undefined
                };

                await supabase
                    .from('stakeholders')
                    .update({ metadata: updatedMetadata })
                    .eq('id', stakeholder.id);
            }
        } catch (e) {
            console.error('[Presence] Failed to sync stakeholder activity:', e);
        }
    }
}
