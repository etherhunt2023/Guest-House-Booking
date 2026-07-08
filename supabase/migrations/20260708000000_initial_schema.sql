-- SQL Schema for Prasar Bharati Guest House Booking Portal

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    department TEXT,
    designation TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'caretaker', 'guest')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of profiles" ON public.profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow users to update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 2. GUEST HOUSES TABLE
CREATE TABLE IF NOT EXISTS public.guest_houses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    caretaker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    latitude NUMERIC,
    longitude NUMERIC,
    facilities TEXT[] DEFAULT '{}'::TEXT[],
    images TEXT[] DEFAULT '{}'::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for guest_houses
ALTER TABLE public.guest_houses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of guest houses" ON public.guest_houses
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admins to manage guest houses" ON public.guest_houses
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 3. ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_house_id UUID REFERENCES public.guest_houses(id) ON DELETE CASCADE NOT NULL,
    room_number TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('suite', 'deluxe', 'standard')),
    capacity INTEGER NOT NULL DEFAULT 2,
    tariff_internal NUMERIC NOT NULL DEFAULT 0,
    tariff_external NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'occupied')),
    images TEXT[] DEFAULT '{}'::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(guest_house_id, room_number)
);

-- Enable RLS for rooms
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of rooms" ON public.rooms
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admins to manage rooms" ON public.rooms
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 4. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    guest_house_id UUID REFERENCES public.guest_houses(id) ON DELETE CASCADE NOT NULL,
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guest_count INTEGER NOT NULL DEFAULT 1,
    purpose TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_caretaker' CHECK (status IN ('pending_caretaker', 'pending_manager', 'approved', 'rejected', 'checked_in', 'checked_out', 'cancelled')),
    caretaker_remarks TEXT,
    manager_remarks TEXT,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT check_dates CHECK (check_out > check_in)
);

-- Enable RLS for bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guests can see own bookings" ON public.bookings
    FOR SELECT TO authenticated USING (auth.uid() = guest_id);

CREATE POLICY "Guests can create bookings" ON public.bookings
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = guest_id);

CREATE POLICY "Staff can manage bookings" ON public.bookings
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'manager', 'caretaker')
        )
    );

-- 5. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    razorpay_order_id TEXT NOT NULL,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'captured', 'failed', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payments" ON public.payments
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE bookings.id = payments.booking_id AND bookings.guest_id = auth.uid()
        )
    );

CREATE POLICY "Admins/Managers can read all payments" ON public.payments
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Admins/Managers can write payments" ON public.payments
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'manager')
        )
    );

-- 6. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can read audit logs" ON public.audit_logs
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 7. TRIGGERS AND FUNCTIONS
-- Trigger to automatically create a profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, department, designation, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Guest'),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'department', ''),
    COALESCE(new.raw_user_meta_data->>'designation', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'guest')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check and create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
   new.updated_at = NOW();
   RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_guest_houses_updated_at BEFORE UPDATE ON public.guest_houses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
