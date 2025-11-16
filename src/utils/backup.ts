import { supabase } from '../lib/supabase';

export async function exportAllData(userId: string) {
  try {
    const [goals, training, reflections, teamMembers, profile] = await Promise.all([
      supabase.from('goals').select('*').eq('user_id', userId),
      supabase.from('training_records').select('*').eq('user_id', userId),
      supabase.from('match_reflections').select('*').eq('user_id', userId),
      supabase.from('team_members').select('*').eq('user_id', userId),
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    ]);

    const backup = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      data: {
        goals: goals.data || [],
        training: training.data || [],
        reflections: reflections.data || [],
        teamMembers: teamMembers.data || [],
        profile: profile.data || null,
      },
    };

    const jsonContent = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `football-assistance-backup-${date}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true };
  } catch (error) {
    console.error('Error exporting data:', error);
    return { success: false, error };
  }
}

export async function importData(file: File, userId: string) {
  try {
    const text = await file.text();
    const backup = JSON.parse(text);

    if (!backup.data) {
      throw new Error('無効なバックアップファイル');
    }

    if (backup.data.goals && backup.data.goals.length > 0) {
      const goalsToImport = backup.data.goals.map((goal: any) => ({
        ...goal,
        id: undefined,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      await supabase.from('goals').insert(goalsToImport);
    }

    if (backup.data.training && backup.data.training.length > 0) {
      const trainingToImport = backup.data.training.map((record: any) => ({
        ...record,
        id: undefined,
        user_id: userId,
        created_at: new Date().toISOString(),
      }));
      await supabase.from('training_records').insert(trainingToImport);
    }

    if (backup.data.reflections && backup.data.reflections.length > 0) {
      const reflectionsToImport = backup.data.reflections.map((reflection: any) => ({
        ...reflection,
        id: undefined,
        user_id: userId,
        created_at: new Date().toISOString(),
        video_url: null,
        video_analysis: null,
        analysis_status: null,
      }));
      await supabase.from('match_reflections').insert(reflectionsToImport);
    }

    if (backup.data.teamMembers && backup.data.teamMembers.length > 0) {
      const teamMembersToImport = backup.data.teamMembers.map((member: any) => ({
        ...member,
        id: undefined,
        user_id: userId,
        created_at: new Date().toISOString(),
      }));
      await supabase.from('team_members').insert(teamMembersToImport);
    }

    return { success: true };
  } catch (error) {
    console.error('Error importing data:', error);
    return { success: false, error };
  }
}
