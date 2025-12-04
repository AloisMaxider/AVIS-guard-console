-- ============================================================
-- NEBULACLOUD COMPLETE DATABASE SCHEMA
-- Generated from Frontend Component Audit
-- ============================================================

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 2. ENUMS
-- ============================================================
CREATE TYPE public.app_role AS ENUM ('user', 'org_admin', 'super_admin');
CREATE TYPE public.alert_severity AS ENUM ('info', 'warning', 'average', 'high', 'disaster');
CREATE TYPE public.alert_status AS ENUM ('active', 'acknowledged', 'resolved', 'suppressed');
CREATE TYPE public.subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'trialing');
CREATE TYPE public.invoice_status AS ENUM ('draft', 'pending', 'paid', 'overdue', 'cancelled');
CREATE TYPE public.notification_channel_type AS ENUM ('email', 'sms', 'slack', 'webhook', 'pagerduty');
CREATE TYPE public.commission_status AS ENUM ('pending', 'approved', 'paid');

-- ============================================================
-- 3. CORE ENTITIES
-- ============================================================

-- organizations (must be created before users due to FK dependency)
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- users
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    encrypted_password TEXT,
    last_sign_in_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- profiles (1:1 with users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- user_roles (1:N with users, security-critical table)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, organization_id, role)
);

-- user_sessions (1:N with users)
CREATE TABLE public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- user_preferences (1:1 with users)
CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'dark',
    language TEXT DEFAULT 'en',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    dashboard_layout JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- password_reset_tokens
CREATE TABLE public.password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- invitations
CREATE TABLE public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    token TEXT NOT NULL UNIQUE,
    invited_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    accepted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. HOST ENTITIES
-- ============================================================

-- host_groups
CREATE TABLE public.host_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- hosts
CREATE TABLE public.hosts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    ip_address INET,
    hostname TEXT,
    status TEXT DEFAULT 'unknown',
    os_type TEXT,
    last_seen_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- host_group_assignments (M:N junction table)
CREATE TABLE public.host_group_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL REFERENCES public.hosts(id) ON DELETE CASCADE,
    host_group_id UUID NOT NULL REFERENCES public.host_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (host_id, host_group_id)
);

-- ============================================================
-- 5. ALERTS ENTITIES
-- ============================================================

-- severity_levels
CREATE TABLE public.severity_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    level INTEGER NOT NULL UNIQUE,
    color TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- alert_categories
CREATE TABLE public.alert_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- alert_tags
CREATE TABLE public.alert_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6b7280',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, name)
);

-- alerts
CREATE TABLE public.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    host_id UUID REFERENCES public.hosts(id) ON DELETE SET NULL,
    category_id UUID REFERENCES public.alert_categories(id) ON DELETE SET NULL,
    severity alert_severity NOT NULL DEFAULT 'info',
    status alert_status NOT NULL DEFAULT 'active',
    title TEXT NOT NULL,
    message TEXT,
    source TEXT,
    acknowledged_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- alert_metadata (1:1 with alerts)
CREATE TABLE public.alert_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL UNIQUE REFERENCES public.alerts(id) ON DELETE CASCADE,
    raw_data JSONB DEFAULT '{}',
    trigger_expression TEXT,
    trigger_value NUMERIC,
    threshold_value NUMERIC,
    unit TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- alert_ai_insights (1:1 with alerts)
CREATE TABLE public.alert_ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL UNIQUE REFERENCES public.alerts(id) ON DELETE CASCADE,
    summary TEXT,
    root_cause TEXT,
    recommendations JSONB DEFAULT '[]',
    confidence_score NUMERIC(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    model_version TEXT,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- throttle_status (1:1 with alerts)
CREATE TABLE public.throttle_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL UNIQUE REFERENCES public.alerts(id) ON DELETE CASCADE,
    is_throttled BOOLEAN DEFAULT FALSE,
    throttle_count INTEGER DEFAULT 0,
    first_occurrence_at TIMESTAMPTZ,
    last_occurrence_at TIMESTAMPTZ,
    dedupe_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- alert_comments (1:N with alerts)
CREATE TABLE public.alert_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- alert_tag_assignments (M:N junction table)
CREATE TABLE public.alert_tag_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES public.alerts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.alert_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (alert_id, tag_id)
);

-- ============================================================
-- 6. CONFIGURATION ENTITIES
-- ============================================================

-- teams
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- alert_thresholds
CREATE TABLE public.alert_thresholds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    operator TEXT NOT NULL CHECK (operator IN ('>', '<', '>=', '<=', '=', '!=')),
    threshold_value NUMERIC NOT NULL,
    severity alert_severity NOT NULL DEFAULT 'warning',
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- notification_channels
CREATE TABLE public.notification_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    channel_type notification_channel_type NOT NULL,
    configuration JSONB NOT NULL DEFAULT '{}',
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- oncall_schedules
CREATE TABLE public.oncall_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    rotation_type TEXT DEFAULT 'weekly',
    start_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- oncall_members
CREATE TABLE public.oncall_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id UUID NOT NULL REFERENCES public.oncall_schedules(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (schedule_id, user_id)
);

-- escalation_policies
CREATE TABLE public.escalation_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    rules JSONB NOT NULL DEFAULT '[]',
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. BILLING ENTITIES
-- ============================================================

-- subscriptions (1:1 with organizations)
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    status subscription_status NOT NULL DEFAULT 'active',
    price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0,
    billing_cycle_start DATE,
    billing_cycle_end DATE,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- invoices (1:N with organizations)
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL UNIQUE,
    amount NUMERIC(10,2) NOT NULL,
    tax_amount NUMERIC(10,2) DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL,
    status invoice_status NOT NULL DEFAULT 'pending',
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    stripe_invoice_id TEXT,
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- payment_methods (1:1 with organizations)
CREATE TABLE public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
    method_type TEXT NOT NULL DEFAULT 'card',
    last_four TEXT,
    brand TEXT,
    expiry_month INTEGER,
    expiry_year INTEGER,
    is_default BOOLEAN DEFAULT TRUE,
    stripe_payment_method_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- usage_metrics (1:1 with organizations)
CREATE TABLE public.usage_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    alerts_count INTEGER DEFAULT 0,
    hosts_count INTEGER DEFAULT 0,
    api_calls_count INTEGER DEFAULT 0,
    storage_bytes BIGINT DEFAULT 0,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. RESELLER ENTITIES
-- ============================================================

-- resellers
CREATE TABLE public.resellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    address JSONB DEFAULT '{}',
    commission_rate NUMERIC(5,2) DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- commission_tiers
CREATE TABLE public.commission_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reseller_id UUID NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
    tier_name TEXT NOT NULL,
    min_revenue NUMERIC(10,2) NOT NULL DEFAULT 0,
    max_revenue NUMERIC(10,2),
    commission_percentage NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- reseller_clients
CREATE TABLE public.reseller_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reseller_id UUID NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    mrr NUMERIC(10,2) DEFAULT 0,
    status TEXT DEFAULT 'active',
    onboarded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (reseller_id, organization_id)
);

-- commissions
CREATE TABLE public.commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reseller_id UUID NOT NULL REFERENCES public.resellers(id) ON DELETE CASCADE,
    reseller_client_id UUID NOT NULL REFERENCES public.reseller_clients(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status commission_status NOT NULL DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 9. AUDIT ENTITIES
-- ============================================================

-- audit_logs
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- security_events
CREATE TABLE public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'info',
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read_at TIMESTAMPTZ,
    action_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. SYSTEM ENTITIES
-- ============================================================

-- system_status
CREATE TABLE public.system_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'operational',
    message TEXT,
    last_check_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- user_filter_preferences
CREATE TABLE public.user_filter_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    filter_name TEXT NOT NULL,
    filter_type TEXT NOT NULL,
    filter_config JSONB NOT NULL DEFAULT '{}',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, filter_name, filter_type)
);

-- ============================================================
-- 11. INDEXES
-- ============================================================

-- Core entity indexes
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_organization_id ON public.user_roles(organization_id);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON public.user_sessions(token);
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX idx_invitations_organization_id ON public.invitations(organization_id);
CREATE INDEX idx_invitations_email ON public.invitations(email);
CREATE INDEX idx_invitations_token ON public.invitations(token);

-- Host entity indexes
CREATE INDEX idx_hosts_organization_id ON public.hosts(organization_id);
CREATE INDEX idx_hosts_status ON public.hosts(status);
CREATE INDEX idx_host_groups_organization_id ON public.host_groups(organization_id);
CREATE INDEX idx_host_group_assignments_host_id ON public.host_group_assignments(host_id);
CREATE INDEX idx_host_group_assignments_host_group_id ON public.host_group_assignments(host_group_id);

-- Alert entity indexes
CREATE INDEX idx_alerts_organization_id ON public.alerts(organization_id);
CREATE INDEX idx_alerts_host_id ON public.alerts(host_id);
CREATE INDEX idx_alerts_category_id ON public.alerts(category_id);
CREATE INDEX idx_alerts_severity ON public.alerts(severity);
CREATE INDEX idx_alerts_status ON public.alerts(status);
CREATE INDEX idx_alerts_created_at ON public.alerts(created_at);
CREATE INDEX idx_alert_metadata_alert_id ON public.alert_metadata(alert_id);
CREATE INDEX idx_alert_ai_insights_alert_id ON public.alert_ai_insights(alert_id);
CREATE INDEX idx_throttle_status_alert_id ON public.throttle_status(alert_id);
CREATE INDEX idx_alert_comments_alert_id ON public.alert_comments(alert_id);
CREATE INDEX idx_alert_comments_user_id ON public.alert_comments(user_id);
CREATE INDEX idx_alert_categories_organization_id ON public.alert_categories(organization_id);
CREATE INDEX idx_alert_tags_organization_id ON public.alert_tags(organization_id);
CREATE INDEX idx_alert_tag_assignments_alert_id ON public.alert_tag_assignments(alert_id);
CREATE INDEX idx_alert_tag_assignments_tag_id ON public.alert_tag_assignments(tag_id);

-- Configuration entity indexes
CREATE INDEX idx_teams_organization_id ON public.teams(organization_id);
CREATE INDEX idx_alert_thresholds_organization_id ON public.alert_thresholds(organization_id);
CREATE INDEX idx_notification_channels_organization_id ON public.notification_channels(organization_id);
CREATE INDEX idx_oncall_schedules_organization_id ON public.oncall_schedules(organization_id);
CREATE INDEX idx_oncall_schedules_team_id ON public.oncall_schedules(team_id);
CREATE INDEX idx_oncall_members_schedule_id ON public.oncall_members(schedule_id);
CREATE INDEX idx_oncall_members_user_id ON public.oncall_members(user_id);
CREATE INDEX idx_escalation_policies_organization_id ON public.escalation_policies(organization_id);

-- Billing entity indexes
CREATE INDEX idx_subscriptions_organization_id ON public.subscriptions(organization_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_invoices_organization_id ON public.invoices(organization_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_payment_methods_organization_id ON public.payment_methods(organization_id);
CREATE INDEX idx_usage_metrics_organization_id ON public.usage_metrics(organization_id);

-- Reseller entity indexes
CREATE INDEX idx_commission_tiers_reseller_id ON public.commission_tiers(reseller_id);
CREATE INDEX idx_reseller_clients_reseller_id ON public.reseller_clients(reseller_id);
CREATE INDEX idx_reseller_clients_organization_id ON public.reseller_clients(organization_id);
CREATE INDEX idx_commissions_reseller_id ON public.commissions(reseller_id);
CREATE INDEX idx_commissions_reseller_client_id ON public.commissions(reseller_client_id);
CREATE INDEX idx_commissions_status ON public.commissions(status);

-- Audit entity indexes
CREATE INDEX idx_audit_logs_organization_id ON public.audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON public.audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_security_events_organization_id ON public.security_events(organization_id);
CREATE INDEX idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX idx_security_events_event_type ON public.security_events(event_type);
CREATE INDEX idx_security_events_severity ON public.security_events(severity);
CREATE INDEX idx_security_events_created_at ON public.security_events(created_at);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_organization_id ON public.notifications(organization_id);
CREATE INDEX idx_notifications_read_at ON public.notifications(read_at);

-- System entity indexes
CREATE INDEX idx_system_status_component ON public.system_status(component);
CREATE INDEX idx_system_status_status ON public.system_status(status);
CREATE INDEX idx_user_filter_preferences_user_id ON public.user_filter_preferences(user_id);
CREATE INDEX idx_user_filter_preferences_filter_type ON public.user_filter_preferences(filter_type);

-- ============================================================
-- 12. SECURITY DEFINER FUNCTION FOR ROLE CHECKS
-- ============================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

CREATE OR REPLACE FUNCTION public.get_user_organization_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT organization_id
    FROM public.profiles
    WHERE user_id = _user_id
    LIMIT 1
$$;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
