BEGIN;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;
CREATE TABLE dm_bao_cao (
    id BIGSERIAL PRIMARY KEY,
    ma_bao_cao VARCHAR(100) NOT NULL,
    ten_bao_cao VARCHAR(255) NOT NULL,
    file_mau VARCHAR(500),
    loai_xuat_file INTEGER,
    mo_ta VARCHAR(500),
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    CONSTRAINT uq_dm_bao_cao_ma UNIQUE (ma_bao_cao),
    CONSTRAINT chk_dm_bao_cao_loai_xuat_file CHECK (
        loai_xuat_file IS NULL
        OR loai_xuat_file IN (10, 20, 30)
    )
);
CREATE TABLE dm_ca_an (
    id SERIAL NOT NULL,
    ma_ca_an VARCHAR(50) NOT NULL,
    ten_ca_an VARCHAR(100) NOT NULL,
    thoi_gian_bat_dau TIME CONSTRAINT dm_ca_an_gio_bat_dau_not_null NOT NULL,
    thoi_gian_ket_thuc TIME CONSTRAINT dm_ca_an_gio_ket_thuc_not_null NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);
CREATE TABLE dm_chinh_sach (
    id BIGSERIAL NOT NULL,
    ma_chinh_sach VARCHAR(50) NOT NULL,
    ten_chinh_sach VARCHAR(255) NOT NULL,
    loai_chinh_sach INTEGER NOT NULL,
    mo_ta VARCHAR(500),
    muc_do_uu_tien INTEGER DEFAULT 1 NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_dm_chinh_sach_loai
        CHECK (
            loai_chinh_sach IN (
                10,
                20,
                30
            )
        ),
    CONSTRAINT chk_dm_chinh_sach_uu_tien
        CHECK (
            muc_do_uu_tien > 0
        )
);
CREATE TABLE dm_chuc_vu (
    id SERIAL NOT NULL,
    ma_chuc_vu VARCHAR(50) NOT NULL,
    ten_chuc_vu VARCHAR(100) NOT NULL,
    mo_ta VARCHAR(500),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
CREATE TABLE dm_co_so (
    id SERIAL NOT NULL,
    ma_co_so VARCHAR(50) NOT NULL,
    ten_co_so VARCHAR(150) NOT NULL,
    dia_chi TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    logo VARCHAR(500),
    favicon VARCHAR(500),
    quoc_gia_id INTEGER,
    tinh_thanh_id INTEGER,
    xa_phuong_id INTEGER,
    logo_doi_tac VARCHAR(500)
);
CREATE TABLE dm_don_vi_tinh (
    id SERIAL NOT NULL,
    ma_don_vi_tinh VARCHAR(50) NOT NULL,
    ten_don_vi_tinh VARCHAR(100) NOT NULL,
    ky_hieu VARCHAR(20),
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    loai_don_vi INTEGER
);
CREATE TABLE dm_gia_ve_an (
    id BIGSERIAL NOT NULL,
    doi_tuong_lay_ve INTEGER NOT NULL,
    co_so_id INTEGER,
    nha_an_id INTEGER,
    ca_an_id INTEGER,
    don_gia NUMERIC(18, 6) NOT NULL,
    tu_ngay DATE NOT NULL,
    den_ngay DATE,
    muc_do_uu_tien INTEGER DEFAULT 1 NOT NULL,
    ghi_chu VARCHAR(500),
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    CONSTRAINT chk_dm_gia_ve_an_doi_tuong CHECK (
        doi_tuong_lay_ve IN (10, 20, 30)
    ),
    CONSTRAINT chk_dm_gia_ve_an_don_gia CHECK (
        don_gia >= 0
    ),
    CONSTRAINT chk_dm_gia_ve_an_thoi_gian CHECK (
        den_ngay IS NULL
        OR tu_ngay <= den_ngay
    ),
    CONSTRAINT chk_dm_gia_ve_an_uu_tien CHECK (
        muc_do_uu_tien > 0
    )
);
CREATE TABLE dm_kho (
    id SERIAL NOT NULL,
    ma_kho VARCHAR(50) NOT NULL,
    ten_kho VARCHAR(150) NOT NULL,
    nha_an_id INTEGER NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    loai_kho SMALLINT,
    dia_diem VARCHAR(255),
    dien_tich NUMERIC(17, 6),
    nhiet_do_toi_thieu NUMERIC(14, 6),
    nhiet_do_toi_da NUMERIC(14, 6),
    mo_ta VARCHAR(500),
    ghi_chu VARCHAR(500),
    CONSTRAINT chk_dm_kho_nhiet_do CHECK (
        nhiet_do_toi_thieu IS NULL
        OR nhiet_do_toi_da IS NULL
        OR nhiet_do_toi_da >= nhiet_do_toi_thieu
    )
);
CREATE TABLE dm_mon_an (
    id SERIAL NOT NULL,
    ma_mon_an VARCHAR(50) NOT NULL,
    ten_mon_an VARCHAR(150) NOT NULL,
    nhom_mon_an_id INTEGER NOT NULL,
    gia_tien NUMERIC(18, 6),
    calories INTEGER,
    mo_ta VARCHAR(500),
    hinh_anh TEXT,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    gia_du_kien NUMERIC(18, 6) DEFAULT 0 NOT NULL
);
CREATE TABLE dm_nha_an (
    id SERIAL NOT NULL,
    ma_nha_an VARCHAR(50) NOT NULL,
    ten_nha_an VARCHAR(150) NOT NULL,
    co_so_id INTEGER,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);
CREATE TABLE dm_nhan_vien (
    id SERIAL NOT NULL,
    ma_nhan_vien VARCHAR(50) NOT NULL,
    ho_ten VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    so_dien_thoai VARCHAR(20),
    anh_dai_dien TEXT,
    chuc_vu_id INTEGER,
    co_so_id INTEGER,
    phong_ban_id INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    ngay_sinh TIMESTAMPTZ,
    gioi_tinh SMALLINT,
    dia_chi TEXT,
    ghi_chu TEXT,
    ma_the VARCHAR(100),
    ma_qr VARCHAR(255),
    ma_barcode VARCHAR(255),
    tinh_thanh_id INTEGER,
    xa_phuong_id INTEGER,
    quoc_gia_id INTEGER
);
CREATE TABLE dm_nhom_mon_an (
    id SERIAL NOT NULL,
    ma_nhom_mon_an VARCHAR(50) NOT NULL,
    ten_nhom_mon_an VARCHAR(150) NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    mo_ta VARCHAR(500)
);
CREATE TABLE dm_nhom_tinh_nang (
    id BIGSERIAL NOT NULL,
    ma_nhom_tinh_nang VARCHAR(50) NOT NULL,
    ten_nhom_tinh_nang VARCHAR(255) NOT NULL,
    mo_ta VARCHAR(500),
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);
CREATE TABLE dm_phong_ban (
    id SERIAL NOT NULL,
    ma_phong_ban VARCHAR(50) NOT NULL,
    ten_phong_ban VARCHAR(150) NOT NULL,
    mo_ta VARCHAR(500),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    co_so_id INTEGER NOT NULL
);
CREATE TABLE dm_quoc_gia (
    id SERIAL NOT NULL,
    ma_quoc_gia VARCHAR(10) NOT NULL,
    ten_quoc_gia VARCHAR(255) NOT NULL,
    ten_tieng_anh VARCHAR(255),
    ma_dien_thoai VARCHAR(10),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    ten_viet_tat VARCHAR(50),
    ma_iso2 VARCHAR(2),
    ma_iso3 VARCHAR(3),
    ten_quoc_gia_en VARCHAR(255)
);
CREATE TABLE dm_quyen (
    id SERIAL NOT NULL,
    ma_quyen VARCHAR(50) NOT NULL,
    ten_quyen VARCHAR(100) NOT NULL,
    mo_ta VARCHAR(500),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
CREATE TABLE dm_quyen_nhom_tinh_nang (
    id BIGSERIAL NOT NULL,
    quyen_id BIGINT NOT NULL,
    nhom_tinh_nang_id BIGINT NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);
CREATE TABLE dm_tai_khoan (
    id SERIAL NOT NULL,
    nhan_vien_id INTEGER NOT NULL,
    ten_dang_nhap VARCHAR(100) NOT NULL,
    mat_khau_hash TEXT NOT NULL,
    so_lan_dang_nhap INTEGER DEFAULT 0 NOT NULL,
    so_lan_dang_nhap_sai SMALLINT DEFAULT 0 NOT NULL,
    khoa_den TIMESTAMP,
    lan_dang_nhap_cuoi TIMESTAMPTZ,
    doi_mat_khau_lan_cuoi TIMESTAMPTZ,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    doi_mat_khau_lan_dau BOOLEAN DEFAULT true NOT NULL,
    bi_khoa BOOLEAN DEFAULT false NOT NULL
);
CREATE TABLE dm_tai_khoan_vai_tro (
    tai_khoan_id INTEGER NOT NULL,
    vai_tro_id INTEGER NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);
CREATE TABLE dm_thiet_lap (
    id SERIAL NOT NULL,
    ma_thiet_lap VARCHAR(100) NOT NULL,
    ten_thiet_lap VARCHAR(255) NOT NULL,
    gia_tri TEXT,
    mo_ta VARCHAR(500),
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);
CREATE TABLE dm_thiet_lap_co_so (
    id SERIAL NOT NULL,
    thiet_lap_id INTEGER NOT NULL,
    co_so_id INTEGER NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);
CREATE TABLE dm_thiet_lap_nhom_tinh_nang (
    id BIGSERIAL NOT NULL,
    thiet_lap_id INTEGER NOT NULL,
    nhom_tinh_nang_id BIGINT NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);
CREATE TABLE dm_thuc_pham (
    id SERIAL NOT NULL,
    ma_thuc_pham VARCHAR(50) NOT NULL,
    ten_thuc_pham VARCHAR(150) NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    gia_nhap NUMERIC(18, 6),
    ghi_chu TEXT,
    don_vi_so_cap_id INTEGER,
    don_vi_su_dung_id INTEGER,
    he_so_quy_doi NUMERIC(12, 6) DEFAULT 1,
    ty_le_hao_hut_du_kien NUMERIC(5, 6) DEFAULT 0 NOT NULL,
    mo_ta VARCHAR(500),
    hinh_anh VARCHAR(500),
    xuat_xu_id INTEGER,
    dieu_kien_bao_quan SMALLINT,
    quy_cach VARCHAR(255),
    CONSTRAINT chk_thuc_pham_cung_don_vi_he_so_1 CHECK (
        don_vi_so_cap_id IS NULL
        OR don_vi_su_dung_id IS NULL
        OR don_vi_so_cap_id <> don_vi_su_dung_id
        OR he_so_quy_doi = 1
    ),
    CONSTRAINT chk_thuc_pham_ty_le_hao_hut CHECK (
        ty_le_hao_hut_du_kien >= 0
        AND ty_le_hao_hut_du_kien <= 100
    )
);
CREATE TABLE dm_tinh_thanh (
    id SERIAL NOT NULL,
    ma_tinh_thanh VARCHAR(20) NOT NULL,
    ten_tinh_thanh VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    quoc_gia_id INTEGER,
    ten_viet_tat VARCHAR(100)
);
CREATE TABLE dm_vai_tro (
    id SERIAL NOT NULL,
    ma_vai_tro VARCHAR(50) NOT NULL,
    ten_vai_tro VARCHAR(100) NOT NULL,
    mo_ta VARCHAR(500),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
CREATE TABLE dm_vai_tro_quyen (
    vai_tro_id INTEGER NOT NULL,
    quyen_id INTEGER NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
CREATE TABLE dm_voucher (
    id SERIAL NOT NULL,
    ma_voucher VARCHAR(50) NOT NULL,
    ten_voucher VARCHAR(255) NOT NULL,
    mo_ta VARCHAR(500),
    loai_mien_giam INTEGER CONSTRAINT dm_voucher_loai_giam_not_null NOT NULL,
    gia_tri NUMERIC(18, 6) NOT NULL,
    so_luong INTEGER DEFAULT 0 NOT NULL,
    da_su_dung INTEGER DEFAULT 0 NOT NULL,
    thoi_gian_bat_dau TIMESTAMP,
    thoi_gian_ket_thuc TIMESTAMP,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    CONSTRAINT ck_voucher_loai CHECK (loai_mien_giam IN (10, 20))
);
CREATE TABLE dm_xa_phuong (
    id SERIAL NOT NULL,
    ma_xa_phuong VARCHAR(30) NOT NULL,
    ten_xa_phuong VARCHAR(255) NOT NULL,
    tinh_thanh_id INTEGER NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    ten_viet_tat VARCHAR(100)
);
CREATE TABLE nv_phieu_lay_ve_an (
    id BIGSERIAL NOT NULL,
    so_phieu VARCHAR(50) NOT NULL,
    thuc_don_ngay_id BIGINT NOT NULL,
    doi_tuong_lay_ve INTEGER NOT NULL,
    nhan_vien_id INTEGER,
    ho_ten_nguoi_lay_ve VARCHAR(150),
    ngay_sinh_nguoi_lay_ve DATE,
    gioi_tinh_nguoi_lay_ve SMALLINT,
    so_dien_thoai_nguoi_lay_ve VARCHAR(20),
    dia_chi_nguoi_lay_ve TEXT,
    don_vi_nguoi_lay_ve VARCHAR(255),
    khach_lau_dai BOOLEAN DEFAULT false NOT NULL,
    so_luong INTEGER DEFAULT 1 NOT NULL,
    don_gia NUMERIC(18, 6) NOT NULL,
    tien_goc NUMERIC(18, 6) NOT NULL,
    tong_mien_giam NUMERIC(18, 6) DEFAULT 0 NOT NULL,
    thanh_tien NUMERIC(18, 6) NOT NULL,
    ghi_chu VARCHAR(1000),
    phuong_thuc_thanh_toan INTEGER,
    trang_thai INTEGER DEFAULT 0 NOT NULL,
    nguoi_tao_id INTEGER NOT NULL,
    nguoi_thanh_toan_id INTEGER,
    thoi_gian_thanh_toan TIMESTAMP,
    nguoi_huy_id INTEGER,
    thoi_gian_huy TIMESTAMP,
    ly_do_huy VARCHAR(500),
    phieu_goc_id BIGINT,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    CONSTRAINT chk_nv_phieu_lay_ve_an_doi_tuong CHECK (
        doi_tuong_lay_ve IN (10, 20, 30)
    ),
    CONSTRAINT chk_nv_phieu_lay_ve_an_gioi_tinh CHECK (
        gioi_tinh_nguoi_lay_ve IS NULL
        OR gioi_tinh_nguoi_lay_ve IN (0, 1, 2)
    ),
    CONSTRAINT chk_nv_phieu_lay_ve_an_phuong_thuc CHECK (
        phuong_thuc_thanh_toan IS NULL
        OR phuong_thuc_thanh_toan IN (10, 20, 30)
    ),
    CONSTRAINT chk_nv_phieu_lay_ve_an_trang_thai CHECK (
        trang_thai IN (-10, 0, 10, 20, 30, 40, 50, 60)
    ),
    CONSTRAINT chk_nv_phieu_lay_ve_an_so_luong CHECK (
        so_luong > 0
    ),
    CONSTRAINT chk_nv_phieu_lay_ve_an_don_gia CHECK (
        don_gia >= 0
    ),
    CONSTRAINT chk_nv_phieu_lay_ve_an_tien_goc CHECK (
        tien_goc >= 0
    ),
    CONSTRAINT chk_nv_phieu_lay_ve_an_tong_mien_giam CHECK (
        tong_mien_giam >= 0
    ),
    CONSTRAINT chk_nv_phieu_lay_ve_an_thanh_tien CHECK (
        thanh_tien >= 0
    ),
    CONSTRAINT chk_nv_phieu_lay_ve_an_nguoi_lay CHECK (
        (
            doi_tuong_lay_ve = 10
            AND nhan_vien_id IS NOT NULL
        )
        OR
        (
            doi_tuong_lay_ve IN (20, 30)
            AND nhan_vien_id IS NULL
            AND ho_ten_nguoi_lay_ve IS NOT NULL
        )
    )
);
CREATE TABLE nv_phieu_nhap (
    id SERIAL NOT NULL,
    ma_phieu_nhap VARCHAR(50) NOT NULL,
    kho_id INTEGER NOT NULL,
    nhan_vien_id INTEGER NOT NULL,
    ngay_nhap TIMESTAMP NOT NULL,
    tong_so_mat_hang INTEGER DEFAULT 0 NOT NULL,
    tong_so_luong NUMERIC(18, 6) DEFAULT 0 NOT NULL,
    tong_tien NUMERIC(18, 6) DEFAULT 0 NOT NULL,
    nguoi_giao VARCHAR(255),
    nguoi_nhan VARCHAR(255),
    hinh_thuc_nhap VARCHAR(30) NOT NULL,
    ghi_chu TEXT,
    trang_thai VARCHAR(30) DEFAULT 'MOI' NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);
CREATE TABLE nv_phieu_xuat (
    id SERIAL NOT NULL,
    ma_phieu_xuat VARCHAR(50) NOT NULL,
    kho_id INTEGER NOT NULL,
    nhan_vien_id INTEGER NOT NULL,
    ngay_xuat TIMESTAMP NOT NULL,
    tong_so_mat_hang INTEGER DEFAULT 0 NOT NULL,
    tong_so_luong NUMERIC(18, 6) DEFAULT 0 NOT NULL,
    ly_do_xuat VARCHAR(100),
    nguoi_nhan VARCHAR(255),
    ghi_chu TEXT,
    trang_thai VARCHAR(30) DEFAULT 'MOI' NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);
CREATE TABLE nv_refresh_token (
    id SERIAL NOT NULL,
    token TEXT NOT NULL,
    tai_khoan_id INTEGER NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);
CREATE TABLE nv_thong_bao (
    id SERIAL NOT NULL,
    tieu_de VARCHAR(255) NOT NULL,
    noi_dung TEXT NOT NULL,
    gui_tat_ca BOOLEAN NOT NULL DEFAULT FALSE,
    tu_dong BOOLEAN NOT NULL DEFAULT FALSE,
    ma_su_kien VARCHAR(100),
    loai_tham_chieu VARCHAR(100),
    tham_chieu_id INTEGER,
    duong_dan VARCHAR(500),
    trang_thai SMALLINT NOT NULL DEFAULT 10,
    nguoi_tao_id INTEGER,
    thoi_gian_gui TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_nv_thong_bao_trang_thai CHECK (
        trang_thai IN (10, 20, 30)
    )
);
CREATE TABLE nv_thanh_toan_ve_an (
    id BIGSERIAL NOT NULL,
    phieu_lay_ve_id BIGINT NOT NULL,
    loai_giao_dich INTEGER NOT NULL,
    phuong_thuc INTEGER NOT NULL,
    so_tien NUMERIC(18, 6) NOT NULL,
    so_luong INTEGER,
    thanh_toan_goc_id BIGINT,
    phieu_moi_id BIGINT,
    ma_giao_dich VARCHAR(100),
    ma_tham_chieu VARCHAR(100),
    ma_chuan_chi VARCHAR(100),
    trang_thai INTEGER DEFAULT 10 NOT NULL,
    noi_dung_loi VARCHAR(1000),
    nguoi_khoi_tao_id INTEGER NOT NULL,
    nguoi_xac_nhan_id INTEGER,
    thoi_gian_thanh_toan TIMESTAMP,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    CONSTRAINT chk_nv_thanh_toan_ve_an_loai CHECK (
        loai_giao_dich IN (10, 20)
    ),
    CONSTRAINT chk_nv_thanh_toan_ve_an_phuong_thuc CHECK (
        phuong_thuc IN (10, 20, 30)
    ),
    CONSTRAINT chk_nv_thanh_toan_ve_an_trang_thai CHECK (
        trang_thai IN (10, 20, 30, 40, 50)
    ),
    CONSTRAINT chk_nv_thanh_toan_ve_an_so_tien CHECK (
        so_tien >= 0
    )
);
CREATE TABLE nv_dot_binh_chon (
    id BIGSERIAL NOT NULL,
    thuc_don_ngay_id BIGINT NOT NULL,
    bat_dau_binh_chon TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    han_binh_chon TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    cho_phep_thay_doi BOOLEAN DEFAULT true NOT NULL,
    trang_thai INTEGER DEFAULT 10 NOT NULL,
    nguoi_tao_id BIGINT,
    nguoi_gui_id BIGINT,
    thoi_gian_gui TIMESTAMP WITHOUT TIME ZONE,
    nguoi_huy_id BIGINT,
    thoi_gian_huy TIMESTAMP WITHOUT TIME ZONE,
    ly_do_huy VARCHAR(500),
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    CONSTRAINT chk_nv_dot_binh_chon_trang_thai CHECK (
        trang_thai IN (10, 20, 30)
    ),
    CONSTRAINT chk_nv_dot_binh_chon_thoi_gian CHECK (
        bat_dau_binh_chon < han_binh_chon
    )
);
CREATE TABLE nv_thuc_don (
    id BIGSERIAL NOT NULL,
    ma_thuc_don VARCHAR(50) NOT NULL,
    ten_thuc_don VARCHAR(255) NOT NULL,
    loai_thuc_don INTEGER NOT NULL,
    tu_ngay TIMESTAMP NOT NULL,
    den_ngay TIMESTAMP NOT NULL,
    co_so_id BIGINT NOT NULL,
    nha_an_id BIGINT NOT NULL,
    ca_an_id BIGINT,
    trang_thai INTEGER DEFAULT 10 NOT NULL,
    mo_ta VARCHAR(500),
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    trang_thai_truoc_huy INTEGER,
    trang_thai_truoc_ket_thuc INTEGER,
    CONSTRAINT chk_nv_thuc_don_loai
        CHECK (loai_thuc_don IN (10, 20, 30, 40)),
    CONSTRAINT chk_nv_thuc_don_trang_thai
        CHECK (trang_thai IN (10, 20, 30, 40, 50, 60)),
    CONSTRAINT chk_nv_thuc_don_ngay
        CHECK (tu_ngay <= den_ngay),
    CONSTRAINT chk_nv_thuc_don_trang_thai_truoc_huy
        CHECK (trang_thai_truoc_huy IS NULL OR trang_thai_truoc_huy IN ( 10, 20, 30, 40)),
    CONSTRAINT chk_nv_thuc_don_trang_thai_truoc_ket_thuc
        CHECK (trang_thai_truoc_ket_thuc IS NULL OR trang_thai_truoc_ket_thuc IN ( 10, 20, 30, 40))
);
CREATE TABLE ct_binh_chon_suat_an (
    id BIGSERIAL NOT NULL,
    dot_binh_chon_id BIGINT NOT NULL,
    tai_khoan_id BIGINT NOT NULL,
    lua_chon BOOLEAN NOT NULL,
    thoi_gian_binh_chon TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);
CREATE TABLE ct_chinh_sach_chuc_vu (
    id BIGSERIAL NOT NULL,
    chinh_sach_id BIGINT NOT NULL,
    chuc_vu_id BIGINT NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE ct_chinh_sach_tai_khoan (
    id BIGSERIAL NOT NULL,
    chinh_sach_id BIGINT NOT NULL,
    tai_khoan_id BIGINT NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE ct_chinh_sach_vai_tro (
    id BIGSERIAL NOT NULL,
    chinh_sach_id BIGINT NOT NULL,
    vai_tro_id BIGINT NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE ct_chinh_sach_voucher (
    chinh_sach_id BIGINT NOT NULL,
    voucher_id INTEGER NOT NULL
);
CREATE TABLE ct_kho_nhan_vien_quan_ly (
    id SERIAL NOT NULL,
    kho_id INTEGER NOT NULL,
    nhan_vien_id INTEGER NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);
CREATE TABLE ct_mon_an_thuc_pham (
    id SERIAL NOT NULL,
    mon_an_id INTEGER NOT NULL,
    thuc_pham_id INTEGER NOT NULL,
    dinh_luong NUMERIC(12, 6) NOT NULL,
    ghi_chu VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_ct_mon_an_thuc_pham_dinh_luong
        CHECK (dinh_luong > 0)
);
CREATE TABLE ct_nha_an_nhan_vien (
    id BIGSERIAL NOT NULL,
    nha_an_id INTEGER NOT NULL,
    nhan_vien_id INTEGER NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);
CREATE TABLE ct_phieu_lay_ve_mien_giam (
    id BIGSERIAL NOT NULL,
    phieu_lay_ve_id BIGINT NOT NULL,
    chinh_sach_id BIGINT,
    voucher_id INTEGER,
    ma_mien_giam VARCHAR(50),
    ten_mien_giam VARCHAR(255) NOT NULL,
    loai_mien_giam INTEGER NOT NULL,
    gia_tri NUMERIC(18, 6) NOT NULL,
    so_tien_truoc_giam NUMERIC(18, 6) NOT NULL,
    so_tien_giam NUMERIC(18, 6) NOT NULL,
    so_tien_sau_giam NUMERIC(18, 6) NOT NULL,
    thu_tu_ap_dung INTEGER DEFAULT 1 NOT NULL,
    ly_do_mien_giam VARCHAR(500),
    nguoi_tao_mien_giam_id INTEGER,
    nguoi_ap_mien_giam_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    CONSTRAINT chk_ct_phieu_lay_ve_mien_giam_loai CHECK (
        loai_mien_giam IN (10, 20)
    ),
    CONSTRAINT chk_ct_phieu_lay_ve_mien_giam_gia_tri CHECK (
        gia_tri >= 0
    ),
    CONSTRAINT chk_ct_phieu_lay_ve_mien_giam_so_tien CHECK (
        so_tien_truoc_giam >= 0
        AND so_tien_giam >= 0
        AND so_tien_sau_giam >= 0
    ),
    CONSTRAINT chk_ct_phieu_lay_ve_mien_giam_thu_tu CHECK (
        thu_tu_ap_dung > 0
    ),
    CONSTRAINT chk_ct_phieu_lay_ve_mien_giam_nguon CHECK (
        (
            chinh_sach_id IS NULL
            AND voucher_id IS NULL
        )
        OR
        (
            chinh_sach_id IS NULL
            AND voucher_id IS NOT NULL
        )
        OR
        (
            chinh_sach_id IS NOT NULL
            AND voucher_id IS NOT NULL
        )
    )
);
CREATE TABLE ct_phieu_nhap (
    id SERIAL NOT NULL,
    phieu_nhap_id INTEGER NOT NULL,
    thuc_pham_id INTEGER NOT NULL,
    so_luong_nhap NUMERIC(18, 6) NOT NULL,
    don_gia NUMERIC(18, 6) NOT NULL,
    thanh_tien NUMERIC(18, 6) NOT NULL,
    han_su_dung DATE,
    so_lo VARCHAR(100),
    ghi_chu TEXT,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    don_vi_so_cap_id INTEGER,
    he_so_quy_doi NUMERIC(18, 6)
);
CREATE TABLE ct_phieu_xuat (
    id SERIAL NOT NULL,
    phieu_xuat_id INTEGER NOT NULL,
    thuc_pham_id INTEGER NOT NULL,
    so_luong_xuat NUMERIC(18, 6) NOT NULL,
    ghi_chu TEXT,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    don_vi_so_cap_id INTEGER,
    he_so_quy_doi NUMERIC(18, 6)
);
CREATE TABLE ct_thong_bao_doi_tuong (
    thong_bao_id INTEGER NOT NULL,
    loai_doi_tuong SMALLINT NOT NULL,
    doi_tuong_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_ct_thong_bao_loai_doi_tuong CHECK (
        loai_doi_tuong IN (10, 20, 30)
    )
);
CREATE TABLE ct_thong_bao_nguoi_nhan (
    thong_bao_id INTEGER NOT NULL,
    tai_khoan_id INTEGER NOT NULL,
    da_doc BOOLEAN NOT NULL DEFAULT FALSE,
    thoi_gian_doc TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_ct_thong_bao_thoi_gian_doc CHECK (
        (da_doc = FALSE AND thoi_gian_doc IS NULL) 
        OR da_doc = TRUE
    )
);
CREATE TABLE ct_thuc_don_ngay (
    id BIGSERIAL NOT NULL,
    thuc_don_id BIGINT NOT NULL,
    ngay DATE NOT NULL,
    ghi_chu VARCHAR(500),
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);
CREATE TABLE ct_thuc_don_nhom_mon_an (
    id BIGSERIAL NOT NULL,
    thuc_don_ngay_id BIGINT NOT NULL,
    nhom_mon_an_id BIGINT NOT NULL,
    thu_tu_hien_thi INTEGER,
    ghi_chu VARCHAR(500),
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    CONSTRAINT chk_ct_thuc_don_nhom_mon_an_thu_tu CHECK (
        thu_tu_hien_thi IS NULL OR thu_tu_hien_thi > 0
    )
);
CREATE TABLE ct_thuc_don_mon_an (
    id BIGSERIAL NOT NULL,
    thuc_don_nhom_mon_an_id BIGINT NOT NULL,
    mon_an_id BIGINT NOT NULL,
    thu_tu_hien_thi INTEGER,
    dinh_luong NUMERIC(12, 6),
    don_vi_tinh_id BIGINT,
    ghi_chu VARCHAR(500),
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    CONSTRAINT chk_ct_thuc_don_mon_an_thu_tu CHECK (
        thu_tu_hien_thi IS NULL OR thu_tu_hien_thi > 0
    ),
    CONSTRAINT chk_ct_thuc_don_mon_an_dinh_luong CHECK (
        dinh_luong IS NULL OR dinh_luong >= 0
    )
);
CREATE TABLE ct_ve_an (
    id BIGSERIAL NOT NULL,
    phieu_lay_ve_id BIGINT NOT NULL,
    thuc_don_ngay_id BIGINT NOT NULL,
    so_thu_tu INTEGER NOT NULL,
    ma_ve VARCHAR(100) NOT NULL,
    qr_token VARCHAR(255) NOT NULL,
    trang_thai INTEGER DEFAULT 10 NOT NULL,
    thoi_gian_su_dung TIMESTAMP,
    nguoi_xac_nhan_id INTEGER,
    nguoi_huy_id INTEGER,
    thoi_gian_huy TIMESTAMP,
    ly_do_huy VARCHAR(500),
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    CONSTRAINT chk_ct_ve_an_trang_thai CHECK (
        trang_thai IN ( 10, 20, 30, 40)
    ),
    CONSTRAINT chk_ct_ve_an_so_thu_tu CHECK (
        so_thu_tu > 0
    )
);
CREATE TABLE ton_kho (
    id SERIAL NOT NULL,
    kho_id INTEGER NOT NULL,
    thuc_pham_id INTEGER NOT NULL,
    so_luong_ton_so_cap NUMERIC(18, 6) DEFAULT 0 NOT NULL,
    so_luong_ton_su_dung NUMERIC(18, 6) DEFAULT 0 NOT NULL,
    gia_von_trung_binh NUMERIC(18, 6) DEFAULT 0 NOT NULL,
    gia_tri_ton NUMERIC(18, 6) DEFAULT 0 NOT NULL,
    ngay_cap_nhat TIMESTAMP DEFAULT now() NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    last_phieu_nhap_id INTEGER,
    last_phieu_xuat_id INTEGER
);
-- Khóa chính
ALTER TABLE dm_gia_ve_an
    ADD CONSTRAINT dm_gia_ve_an_pkey PRIMARY KEY (id);
ALTER TABLE nv_phieu_lay_ve_an
    ADD CONSTRAINT nv_phieu_lay_ve_an_pkey PRIMARY KEY (id);
ALTER TABLE nv_thanh_toan_ve_an
    ADD CONSTRAINT nv_thanh_toan_ve_an_pkey PRIMARY KEY (id);
ALTER TABLE ct_phieu_lay_ve_mien_giam
    ADD CONSTRAINT ct_phieu_lay_ve_mien_giam_pkey PRIMARY KEY (id);
ALTER TABLE ct_ve_an
    ADD CONSTRAINT ct_ve_an_pkey PRIMARY KEY (id);
ALTER TABLE nv_dot_binh_chon
    ADD CONSTRAINT nv_dot_binh_chon_pkey PRIMARY KEY (id);
ALTER TABLE ct_binh_chon_suat_an
    ADD CONSTRAINT ct_binh_chon_suat_an_pkey PRIMARY KEY (id);
ALTER TABLE ct_chinh_sach_chuc_vu
    ADD CONSTRAINT ct_chinh_sach_chuc_vu_pkey PRIMARY KEY (id);
ALTER TABLE ct_chinh_sach_tai_khoan
    ADD CONSTRAINT ct_chinh_sach_tai_khoan_pkey PRIMARY KEY (id);
ALTER TABLE ct_chinh_sach_vai_tro
    ADD CONSTRAINT ct_chinh_sach_vai_tro_pkey PRIMARY KEY (id);
ALTER TABLE ct_chinh_sach_voucher
    ADD CONSTRAINT pk_ct_chinh_sach_voucher PRIMARY KEY (chinh_sach_id, voucher_id);
ALTER TABLE ct_kho_nhan_vien_quan_ly
    ADD CONSTRAINT ct_kho_nhan_vien_quan_ly_pkey PRIMARY KEY (id);
ALTER TABLE ct_mon_an_thuc_pham
    ADD CONSTRAINT ct_mon_an_thuc_pham_pkey PRIMARY KEY (id);
ALTER TABLE ct_nha_an_nhan_vien
    ADD CONSTRAINT ct_nha_an_nhan_vien_pkey PRIMARY KEY (id);
ALTER TABLE ct_phieu_nhap
    ADD CONSTRAINT ct_phieu_nhap_pkey PRIMARY KEY (id);
ALTER TABLE ct_phieu_xuat
    ADD CONSTRAINT ct_phieu_xuat_pkey PRIMARY KEY (id);
ALTER TABLE dm_ca_an
    ADD CONSTRAINT dm_ca_an_pkey PRIMARY KEY (id);
ALTER TABLE dm_chinh_sach
    ADD CONSTRAINT dm_chinh_sach_pkey PRIMARY KEY (id);
ALTER TABLE dm_chuc_vu
    ADD CONSTRAINT dm_chuc_vu_pkey PRIMARY KEY (id);
ALTER TABLE dm_co_so
    ADD CONSTRAINT dm_co_so_pkey PRIMARY KEY (id);
ALTER TABLE dm_don_vi_tinh
    ADD CONSTRAINT dm_don_vi_tinh_pkey PRIMARY KEY (id);
ALTER TABLE dm_kho
    ADD CONSTRAINT dm_kho_pkey PRIMARY KEY (id);
ALTER TABLE dm_mon_an
    ADD CONSTRAINT dm_mon_an_pkey PRIMARY KEY (id);
ALTER TABLE dm_nha_an
    ADD CONSTRAINT dm_nha_an_pkey PRIMARY KEY (id);
ALTER TABLE dm_nhan_vien
    ADD CONSTRAINT dm_nhan_vien_pkey PRIMARY KEY (id);
ALTER TABLE dm_nhom_mon_an
    ADD CONSTRAINT dm_nhom_mon_an_pkey PRIMARY KEY (id);
ALTER TABLE dm_nhom_tinh_nang
    ADD CONSTRAINT dm_nhom_tinh_nang_pkey PRIMARY KEY (id);
ALTER TABLE dm_phong_ban
    ADD CONSTRAINT dm_phong_ban_pkey PRIMARY KEY (id);
ALTER TABLE dm_quoc_gia
    ADD CONSTRAINT dm_quoc_gia_pkey PRIMARY KEY (id);
ALTER TABLE dm_quyen
    ADD CONSTRAINT dm_quyen_pkey PRIMARY KEY (id);
ALTER TABLE dm_quyen_nhom_tinh_nang
    ADD CONSTRAINT dm_quyen_nhom_tinh_nang_pkey PRIMARY KEY (id);
ALTER TABLE dm_tai_khoan
    ADD CONSTRAINT dm_tai_khoan_pkey PRIMARY KEY (id);
ALTER TABLE dm_tai_khoan_vai_tro
    ADD CONSTRAINT dm_tai_khoan_vai_tro_pkey PRIMARY KEY (tai_khoan_id, vai_tro_id);
ALTER TABLE dm_thiet_lap
    ADD CONSTRAINT dm_thiet_lap_pkey PRIMARY KEY (id);
ALTER TABLE dm_thiet_lap_co_so
    ADD CONSTRAINT dm_thiet_lap_co_so_pkey PRIMARY KEY (id);
ALTER TABLE dm_thiet_lap_nhom_tinh_nang
    ADD CONSTRAINT dm_thiet_lap_nhom_tinh_nang_pkey PRIMARY KEY (id);
ALTER TABLE dm_thuc_pham
    ADD CONSTRAINT dm_thuc_pham_pkey PRIMARY KEY (id);
ALTER TABLE dm_tinh_thanh
    ADD CONSTRAINT dm_tinh_thanh_pkey PRIMARY KEY (id);
ALTER TABLE dm_vai_tro
    ADD CONSTRAINT dm_vai_tro_pkey PRIMARY KEY (id);
ALTER TABLE dm_vai_tro_quyen
    ADD CONSTRAINT dm_vai_tro_quyen_pkey PRIMARY KEY (vai_tro_id, quyen_id);
ALTER TABLE dm_voucher
    ADD CONSTRAINT dm_voucher_pkey PRIMARY KEY (id);
ALTER TABLE dm_xa_phuong
    ADD CONSTRAINT dm_xa_phuong_pkey PRIMARY KEY (id);
ALTER TABLE nv_phieu_nhap
    ADD CONSTRAINT nv_phieu_nhap_pkey PRIMARY KEY (id);
ALTER TABLE nv_phieu_xuat
    ADD CONSTRAINT nv_phieu_xuat_pkey PRIMARY KEY (id);
ALTER TABLE nv_refresh_token
    ADD CONSTRAINT nv_refresh_token_pkey PRIMARY KEY (id);
ALTER TABLE nv_thong_bao
    ADD CONSTRAINT nv_thong_bao_pkey PRIMARY KEY (id);
ALTER TABLE ct_thong_bao_doi_tuong
    ADD CONSTRAINT pk_ct_thong_bao_doi_tuong PRIMARY KEY (thong_bao_id, loai_doi_tuong, doi_tuong_id);
ALTER TABLE ct_thong_bao_nguoi_nhan
    ADD CONSTRAINT pk_ct_thong_bao_nguoi_nhan PRIMARY KEY (thong_bao_id, tai_khoan_id);
ALTER TABLE nv_thuc_don
    ADD CONSTRAINT nv_thuc_don_pkey PRIMARY KEY (id);
ALTER TABLE ct_thuc_don_ngay
    ADD CONSTRAINT ct_thuc_don_ngay_pkey PRIMARY KEY (id);
ALTER TABLE ct_thuc_don_nhom_mon_an
    ADD CONSTRAINT ct_thuc_don_nhom_mon_an_pkey PRIMARY KEY (id);
ALTER TABLE ct_thuc_don_mon_an
    ADD CONSTRAINT ct_thuc_don_mon_an_pkey PRIMARY KEY (id);
ALTER TABLE ton_kho
    ADD CONSTRAINT ton_kho_pkey PRIMARY KEY (id);
-- Ràng buộc duy nhất
ALTER TABLE nv_phieu_lay_ve_an
    ADD CONSTRAINT uq_nv_phieu_lay_ve_an_so_phieu UNIQUE (so_phieu);
ALTER TABLE ct_phieu_lay_ve_mien_giam
    ADD CONSTRAINT uq_ct_phieu_lay_ve_mien_giam_thu_tu UNIQUE (phieu_lay_ve_id, thu_tu_ap_dung);
ALTER TABLE ct_ve_an
    ADD CONSTRAINT uq_ct_ve_an_ma_ve UNIQUE (ma_ve);
ALTER TABLE ct_ve_an
    ADD CONSTRAINT uq_ct_ve_an_qr_token UNIQUE (qr_token);
ALTER TABLE ct_ve_an
    ADD CONSTRAINT uq_ct_ve_an_phieu_thu_tu UNIQUE (phieu_lay_ve_id, so_thu_tu);
ALTER TABLE ct_binh_chon_suat_an
    ADD CONSTRAINT uq_ct_binh_chon_suat_an UNIQUE (dot_binh_chon_id, tai_khoan_id);
ALTER TABLE ct_chinh_sach_chuc_vu
    ADD CONSTRAINT uq_ct_chinh_sach_chuc_vu UNIQUE (chinh_sach_id, chuc_vu_id);
ALTER TABLE ct_chinh_sach_tai_khoan
    ADD CONSTRAINT uq_ct_chinh_sach_tai_khoan UNIQUE (chinh_sach_id, tai_khoan_id);
ALTER TABLE ct_chinh_sach_vai_tro
    ADD CONSTRAINT uq_ct_chinh_sach_vai_tro UNIQUE (chinh_sach_id, vai_tro_id);
ALTER TABLE ct_kho_nhan_vien_quan_ly
    ADD CONSTRAINT uq_ct_kho_nhan_vien_quan_ly UNIQUE (kho_id, nhan_vien_id);
ALTER TABLE ct_mon_an_thuc_pham
    ADD CONSTRAINT uq_ct_mon_an_thuc_pham UNIQUE (mon_an_id, thuc_pham_id);
ALTER TABLE ct_nha_an_nhan_vien
    ADD CONSTRAINT uq_ct_nha_an_nhan_vien UNIQUE (nha_an_id, nhan_vien_id);
ALTER TABLE dm_ca_an
    ADD CONSTRAINT dm_ca_an_ma_ca_an_key UNIQUE (ma_ca_an);
ALTER TABLE dm_chinh_sach
    ADD CONSTRAINT uq_dm_chinh_sach_ma UNIQUE (ma_chinh_sach);
ALTER TABLE dm_chuc_vu
    ADD CONSTRAINT dm_chuc_vu_ma_chuc_vu_key UNIQUE (ma_chuc_vu);
ALTER TABLE dm_co_so
    ADD CONSTRAINT dm_co_so_ma_co_so_key UNIQUE (ma_co_so);
ALTER TABLE dm_don_vi_tinh
    ADD CONSTRAINT dm_don_vi_tinh_ma_don_vi_tinh_key UNIQUE (ma_don_vi_tinh);
ALTER TABLE dm_kho
    ADD CONSTRAINT dm_kho_ma_kho_key UNIQUE (ma_kho);
ALTER TABLE dm_mon_an
    ADD CONSTRAINT dm_mon_an_ma_mon_an_key UNIQUE (ma_mon_an);
ALTER TABLE dm_nha_an
    ADD CONSTRAINT dm_nha_an_ma_nha_an_key UNIQUE (ma_nha_an);
ALTER TABLE dm_nhan_vien
    ADD CONSTRAINT dm_nhan_vien_ma_nhan_vien_key UNIQUE (ma_nhan_vien);
ALTER TABLE dm_nhan_vien
    ADD CONSTRAINT dm_nhan_vien_email_key UNIQUE (email);
ALTER TABLE dm_nhan_vien
    ADD CONSTRAINT uq_dm_nhan_vien_ma_the UNIQUE (ma_the);
ALTER TABLE dm_nhan_vien
    ADD CONSTRAINT uq_dm_nhan_vien_ma_qr UNIQUE (ma_qr);
ALTER TABLE dm_nhan_vien
    ADD CONSTRAINT uq_dm_nhan_vien_ma_barcode UNIQUE (ma_barcode);
ALTER TABLE dm_nhom_mon_an
    ADD CONSTRAINT dm_nhom_mon_an_ma_nhom_mon_an_key UNIQUE (ma_nhom_mon_an);
ALTER TABLE dm_nhom_tinh_nang
    ADD CONSTRAINT dm_nhom_tinh_nang_ma_nhom_tinh_nang_key UNIQUE (ma_nhom_tinh_nang);
ALTER TABLE dm_phong_ban
    ADD CONSTRAINT dm_phong_ban_ma_phong_ban_key UNIQUE (ma_phong_ban);
ALTER TABLE dm_quoc_gia
    ADD CONSTRAINT dm_quoc_gia_ma_quoc_gia_key UNIQUE (ma_quoc_gia);
ALTER TABLE dm_quyen
    ADD CONSTRAINT dm_quyen_ma_quyen_key UNIQUE (ma_quyen);
ALTER TABLE dm_quyen_nhom_tinh_nang
    ADD CONSTRAINT uq_quyen_nhom_tinh_nang UNIQUE (quyen_id, nhom_tinh_nang_id);
ALTER TABLE dm_tai_khoan
    ADD CONSTRAINT dm_tai_khoan_nhan_vien_id_key UNIQUE (nhan_vien_id);
ALTER TABLE dm_tai_khoan
    ADD CONSTRAINT dm_tai_khoan_ten_dang_nhap_key UNIQUE (ten_dang_nhap);
ALTER TABLE dm_thiet_lap
    ADD CONSTRAINT dm_thiet_lap_ma_thiet_lap_key UNIQUE (ma_thiet_lap);
ALTER TABLE dm_thiet_lap_co_so
    ADD CONSTRAINT uq_thiet_lap_co_so UNIQUE (thiet_lap_id, co_so_id);
ALTER TABLE dm_thiet_lap_nhom_tinh_nang
    ADD CONSTRAINT uq_thiet_lap_nhom_tinh_nang UNIQUE (thiet_lap_id, nhom_tinh_nang_id);
ALTER TABLE dm_thuc_pham
    ADD CONSTRAINT dm_thuc_pham_ma_thuc_pham_key UNIQUE (ma_thuc_pham);
ALTER TABLE dm_tinh_thanh
    ADD CONSTRAINT dm_tinh_thanh_ma_tinh_thanh_key UNIQUE (ma_tinh_thanh);
ALTER TABLE dm_vai_tro
    ADD CONSTRAINT dm_vai_tro_ma_vai_tro_key UNIQUE (ma_vai_tro);
ALTER TABLE dm_voucher
    ADD CONSTRAINT dm_voucher_ma_voucher_key UNIQUE (ma_voucher);
ALTER TABLE dm_xa_phuong
    ADD CONSTRAINT dm_xa_phuong_ma_xa_phuong_key UNIQUE (ma_xa_phuong);
ALTER TABLE nv_phieu_nhap
    ADD CONSTRAINT nv_phieu_nhap_ma_phieu_nhap_key UNIQUE (ma_phieu_nhap);
ALTER TABLE nv_phieu_xuat
    ADD CONSTRAINT nv_phieu_xuat_ma_phieu_xuat_key UNIQUE (ma_phieu_xuat);
ALTER TABLE nv_refresh_token
    ADD CONSTRAINT nv_refresh_token_token_key UNIQUE (token);
ALTER TABLE nv_thuc_don
    ADD CONSTRAINT uq_nv_thuc_don_ma UNIQUE (ma_thuc_don);
ALTER TABLE ct_thuc_don_ngay
    ADD CONSTRAINT uq_ct_thuc_don_ngay UNIQUE (thuc_don_id, ngay);
ALTER TABLE ct_thuc_don_nhom_mon_an
    ADD CONSTRAINT uq_ct_thuc_don_nhom_mon_an UNIQUE (thuc_don_ngay_id, nhom_mon_an_id);
ALTER TABLE ct_thuc_don_mon_an
    ADD CONSTRAINT uq_ct_thuc_don_mon_an UNIQUE (thuc_don_nhom_mon_an_id, mon_an_id);
ALTER TABLE ton_kho
    ADD CONSTRAINT uq_ton_kho UNIQUE (kho_id, thuc_pham_id);
-- Khóa ngoại
ALTER TABLE dm_gia_ve_an
    ADD CONSTRAINT fk_dm_gia_ve_an_co_so
    FOREIGN KEY (co_so_id)
    REFERENCES dm_co_so (id);
ALTER TABLE dm_gia_ve_an
    ADD CONSTRAINT fk_dm_gia_ve_an_nha_an
    FOREIGN KEY (nha_an_id)
    REFERENCES dm_nha_an (id);
ALTER TABLE dm_gia_ve_an
    ADD CONSTRAINT fk_dm_gia_ve_an_ca_an
    FOREIGN KEY (ca_an_id)
    REFERENCES dm_ca_an (id);
ALTER TABLE nv_phieu_lay_ve_an
    ADD CONSTRAINT fk_nv_phieu_lay_ve_an_thuc_don_ngay
    FOREIGN KEY (thuc_don_ngay_id)
    REFERENCES ct_thuc_don_ngay (id);
ALTER TABLE nv_phieu_lay_ve_an
    ADD CONSTRAINT fk_nv_phieu_lay_ve_an_nhan_vien
    FOREIGN KEY (nhan_vien_id)
    REFERENCES dm_nhan_vien (id);
ALTER TABLE nv_phieu_lay_ve_an
    ADD CONSTRAINT fk_nv_phieu_lay_ve_an_nguoi_tao
    FOREIGN KEY (nguoi_tao_id)
    REFERENCES dm_tai_khoan (id);
ALTER TABLE nv_phieu_lay_ve_an
    ADD CONSTRAINT fk_nv_phieu_lay_ve_an_nguoi_thanh_toan
    FOREIGN KEY (nguoi_thanh_toan_id)
    REFERENCES dm_tai_khoan (id);
ALTER TABLE nv_phieu_lay_ve_an
    ADD CONSTRAINT fk_nv_phieu_lay_ve_an_nguoi_huy
    FOREIGN KEY (nguoi_huy_id)
    REFERENCES dm_tai_khoan (id);
ALTER TABLE nv_phieu_lay_ve_an
    ADD CONSTRAINT fk_nv_phieu_lay_ve_an_phieu_goc
    FOREIGN KEY (phieu_goc_id)
    REFERENCES nv_phieu_lay_ve_an (id);
ALTER TABLE ct_phieu_lay_ve_mien_giam
    ADD CONSTRAINT fk_ct_phieu_lay_ve_mien_giam_phieu
    FOREIGN KEY (phieu_lay_ve_id)
    REFERENCES nv_phieu_lay_ve_an (id)
    ON DELETE CASCADE;
ALTER TABLE ct_phieu_lay_ve_mien_giam
    ADD CONSTRAINT fk_ct_phieu_lay_ve_mien_giam_chinh_sach
    FOREIGN KEY (chinh_sach_id)
    REFERENCES dm_chinh_sach (id);
ALTER TABLE ct_phieu_lay_ve_mien_giam
    ADD CONSTRAINT fk_ct_phieu_lay_ve_mien_giam_voucher
    FOREIGN KEY (voucher_id)
    REFERENCES dm_voucher (id);
ALTER TABLE ct_phieu_lay_ve_mien_giam
    ADD CONSTRAINT fk_ct_phieu_lay_ve_mien_giam_nguoi_tao
    FOREIGN KEY (nguoi_tao_mien_giam_id)
    REFERENCES dm_tai_khoan (id);
ALTER TABLE ct_phieu_lay_ve_mien_giam
    ADD CONSTRAINT fk_ct_phieu_lay_ve_mien_giam_nguoi_ap
    FOREIGN KEY (nguoi_ap_mien_giam_id)
    REFERENCES dm_tai_khoan (id);
ALTER TABLE nv_thanh_toan_ve_an
    ADD CONSTRAINT fk_nv_thanh_toan_ve_an_phieu
    FOREIGN KEY (phieu_lay_ve_id)
    REFERENCES nv_phieu_lay_ve_an (id);
ALTER TABLE nv_thanh_toan_ve_an
    ADD CONSTRAINT fk_nv_thanh_toan_ve_an_thanh_toan_goc
    FOREIGN KEY (thanh_toan_goc_id)
    REFERENCES nv_thanh_toan_ve_an (id);
ALTER TABLE nv_thanh_toan_ve_an
    ADD CONSTRAINT fk_nv_thanh_toan_ve_an_phieu_moi
    FOREIGN KEY (phieu_moi_id)
    REFERENCES nv_phieu_lay_ve_an (id);
ALTER TABLE nv_thanh_toan_ve_an
    ADD CONSTRAINT fk_nv_thanh_toan_ve_an_nguoi_khoi_tao
    FOREIGN KEY (nguoi_khoi_tao_id)
    REFERENCES dm_tai_khoan (id);
ALTER TABLE nv_thanh_toan_ve_an
    ADD CONSTRAINT fk_nv_thanh_toan_ve_an_nguoi_xac_nhan
    FOREIGN KEY (nguoi_xac_nhan_id)
    REFERENCES dm_tai_khoan (id);
ALTER TABLE ct_ve_an
    ADD CONSTRAINT fk_ct_ve_an_phieu
    FOREIGN KEY (phieu_lay_ve_id)
    REFERENCES nv_phieu_lay_ve_an (id)
    ON DELETE CASCADE;
ALTER TABLE ct_ve_an
    ADD CONSTRAINT fk_ct_ve_an_thuc_don_ngay
    FOREIGN KEY (thuc_don_ngay_id)
    REFERENCES ct_thuc_don_ngay (id);
ALTER TABLE ct_ve_an
    ADD CONSTRAINT fk_ct_ve_an_nguoi_xac_nhan
    FOREIGN KEY (nguoi_xac_nhan_id)
    REFERENCES dm_tai_khoan (id);
ALTER TABLE ct_ve_an
    ADD CONSTRAINT fk_ct_ve_an_nguoi_huy
    FOREIGN KEY (nguoi_huy_id)
    REFERENCES dm_tai_khoan (id);
ALTER TABLE nv_dot_binh_chon
    ADD CONSTRAINT fk_nv_dot_binh_chon_thuc_don_ngay
    FOREIGN KEY (thuc_don_ngay_id)
    REFERENCES ct_thuc_don_ngay (id)
    ON DELETE CASCADE;
ALTER TABLE nv_dot_binh_chon
    ADD CONSTRAINT fk_nv_dot_binh_chon_nguoi_tao
    FOREIGN KEY (nguoi_tao_id)
    REFERENCES dm_tai_khoan (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
ALTER TABLE nv_dot_binh_chon
    ADD CONSTRAINT fk_nv_dot_binh_chon_nguoi_gui
    FOREIGN KEY (nguoi_gui_id)
    REFERENCES dm_tai_khoan (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
ALTER TABLE nv_dot_binh_chon
    ADD CONSTRAINT fk_nv_dot_binh_chon_nguoi_huy
    FOREIGN KEY (nguoi_huy_id)
    REFERENCES dm_tai_khoan (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
ALTER TABLE ct_binh_chon_suat_an
    ADD CONSTRAINT fk_ct_binh_chon_suat_an_dot
    FOREIGN KEY (dot_binh_chon_id)
    REFERENCES nv_dot_binh_chon (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
ALTER TABLE ct_binh_chon_suat_an
    ADD CONSTRAINT fk_ct_binh_chon_suat_an_tai_khoan
    FOREIGN KEY (tai_khoan_id)
    REFERENCES dm_tai_khoan (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
ALTER TABLE ct_chinh_sach_chuc_vu
    ADD CONSTRAINT fk_ct_cscv_chinh_sach
    FOREIGN KEY (chinh_sach_id)
    REFERENCES dm_chinh_sach (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
ALTER TABLE ct_chinh_sach_chuc_vu
    ADD CONSTRAINT fk_ct_cscv_chuc_vu
    FOREIGN KEY (chuc_vu_id)
    REFERENCES dm_chuc_vu (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;
ALTER TABLE ct_chinh_sach_tai_khoan
    ADD CONSTRAINT fk_ct_cstk_chinh_sach
    FOREIGN KEY (chinh_sach_id)
    REFERENCES dm_chinh_sach (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
ALTER TABLE ct_chinh_sach_tai_khoan
    ADD CONSTRAINT fk_ct_cstk_tai_khoan
    FOREIGN KEY (tai_khoan_id)
    REFERENCES dm_tai_khoan (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;
ALTER TABLE ct_chinh_sach_vai_tro
    ADD CONSTRAINT fk_ct_csvt_chinh_sach
    FOREIGN KEY (chinh_sach_id)
    REFERENCES dm_chinh_sach (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
ALTER TABLE ct_chinh_sach_vai_tro
    ADD CONSTRAINT fk_ct_csvt_vai_tro
    FOREIGN KEY (vai_tro_id)
    REFERENCES dm_vai_tro (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;
ALTER TABLE ct_kho_nhan_vien_quan_ly
    ADD CONSTRAINT fk_ct_knvql_kho
    FOREIGN KEY (kho_id)
    REFERENCES dm_kho (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
ALTER TABLE ct_kho_nhan_vien_quan_ly
    ADD CONSTRAINT fk_ct_knvql_nhan_vien
    FOREIGN KEY (nhan_vien_id)
    REFERENCES dm_nhan_vien (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;
ALTER TABLE ct_mon_an_thuc_pham
    ADD CONSTRAINT fk_ct_mon_an_thuc_pham_mon_an
    FOREIGN KEY (mon_an_id)
    REFERENCES dm_mon_an (id)
    ON DELETE CASCADE;
ALTER TABLE ct_mon_an_thuc_pham
    ADD CONSTRAINT fk_ct_mon_an_thuc_pham_thuc_pham
    FOREIGN KEY (thuc_pham_id)
    REFERENCES dm_thuc_pham (id);
ALTER TABLE ct_nha_an_nhan_vien
    ADD CONSTRAINT fk_ct_nanv_nha_an
    FOREIGN KEY (nha_an_id)
    REFERENCES dm_nha_an (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
ALTER TABLE ct_nha_an_nhan_vien
    ADD CONSTRAINT fk_ct_nanv_nhan_vien
    FOREIGN KEY (nhan_vien_id)
    REFERENCES dm_nhan_vien (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;
ALTER TABLE ct_phieu_nhap
    ADD CONSTRAINT fk_ct_pn
    FOREIGN KEY (phieu_nhap_id)
    REFERENCES nv_phieu_nhap (id)
    ON DELETE CASCADE;
ALTER TABLE ct_phieu_nhap
    ADD CONSTRAINT fk_ct_pn_tp
    FOREIGN KEY (thuc_pham_id)
    REFERENCES dm_thuc_pham (id);
ALTER TABLE ct_phieu_nhap
    ADD CONSTRAINT fk_ct_pn_don_vi_so_cap
    FOREIGN KEY (don_vi_so_cap_id)
    REFERENCES dm_don_vi_tinh (id);
ALTER TABLE ct_phieu_xuat
    ADD CONSTRAINT fk_ct_px
    FOREIGN KEY (phieu_xuat_id)
    REFERENCES nv_phieu_xuat (id)
    ON DELETE CASCADE;
ALTER TABLE ct_phieu_xuat
    ADD CONSTRAINT fk_ct_px_tp
    FOREIGN KEY (thuc_pham_id)
    REFERENCES dm_thuc_pham (id);
ALTER TABLE ct_phieu_xuat
    ADD CONSTRAINT fk_ct_px_don_vi_so_cap
    FOREIGN KEY (don_vi_so_cap_id)
    REFERENCES dm_don_vi_tinh (id);
ALTER TABLE ct_chinh_sach_voucher
    ADD CONSTRAINT fk_ct_csv_chinh_sach
    FOREIGN KEY (chinh_sach_id)
    REFERENCES dm_chinh_sach(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
ALTER TABLE ct_chinh_sach_voucher
    ADD CONSTRAINT fk_ct_csv_voucher
    FOREIGN KEY (voucher_id)
    REFERENCES dm_voucher(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;
ALTER TABLE dm_co_so
    ADD CONSTRAINT fk_co_so_quoc_gia
    FOREIGN KEY (quoc_gia_id)
    REFERENCES dm_quoc_gia (id);
ALTER TABLE dm_co_so
    ADD CONSTRAINT fk_co_so_tinh_thanh
    FOREIGN KEY (tinh_thanh_id)
    REFERENCES dm_tinh_thanh (id);
ALTER TABLE dm_co_so
    ADD CONSTRAINT fk_co_so_xa_phuong
    FOREIGN KEY (xa_phuong_id)
    REFERENCES dm_xa_phuong (id);
ALTER TABLE dm_kho
    ADD CONSTRAINT fk_kho_nha_an
    FOREIGN KEY (nha_an_id)
    REFERENCES dm_nha_an (id);
ALTER TABLE dm_mon_an
    ADD CONSTRAINT fk_mon_an_nhom_mon
    FOREIGN KEY (nhom_mon_an_id)
    REFERENCES dm_nhom_mon_an (id);
ALTER TABLE dm_nha_an
    ADD CONSTRAINT fk_nha_an_co_so
    FOREIGN KEY (co_so_id)
    REFERENCES dm_co_so (id);
ALTER TABLE dm_nhan_vien
    ADD CONSTRAINT fk_nhan_vien_chuc_vu
    FOREIGN KEY (chuc_vu_id)
    REFERENCES dm_chuc_vu (id);
ALTER TABLE dm_nhan_vien
    ADD CONSTRAINT fk_nhan_vien_co_so
    FOREIGN KEY (co_so_id)
    REFERENCES dm_co_so (id);
ALTER TABLE dm_nhan_vien
    ADD CONSTRAINT fk_nhan_vien_phong_ban
    FOREIGN KEY (phong_ban_id)
    REFERENCES dm_phong_ban (id);
ALTER TABLE dm_nhan_vien
    ADD CONSTRAINT fk_nv_tinh_thanh
    FOREIGN KEY (tinh_thanh_id)
    REFERENCES dm_tinh_thanh (id);
ALTER TABLE dm_nhan_vien
    ADD CONSTRAINT fk_nv_xa_phuong
    FOREIGN KEY (xa_phuong_id)
    REFERENCES dm_xa_phuong (id);
ALTER TABLE dm_nhan_vien
    ADD CONSTRAINT fk_nv_quoc_gia
    FOREIGN KEY (quoc_gia_id)
    REFERENCES dm_quoc_gia (id);
ALTER TABLE dm_phong_ban
    ADD CONSTRAINT fk_dm_phong_ban_co_so
    FOREIGN KEY (co_so_id)
    REFERENCES dm_co_so (id);
ALTER TABLE dm_quyen_nhom_tinh_nang
    ADD CONSTRAINT fk_quyen_nhom_tinh_nang_quyen
    FOREIGN KEY (quyen_id)
    REFERENCES dm_quyen (id);
ALTER TABLE dm_quyen_nhom_tinh_nang
    ADD CONSTRAINT fk_quyen_nhom_tinh_nang_nhom
    FOREIGN KEY (nhom_tinh_nang_id)
    REFERENCES dm_nhom_tinh_nang (id);
ALTER TABLE dm_tai_khoan
    ADD CONSTRAINT fk_dm_tai_khoan_nhan_vien
    FOREIGN KEY (nhan_vien_id)
    REFERENCES dm_nhan_vien (id)
    ON DELETE CASCADE;
ALTER TABLE dm_tai_khoan_vai_tro
    ADD CONSTRAINT fk_tai_khoan_vai_tro_tai_khoan
    FOREIGN KEY (tai_khoan_id)
    REFERENCES dm_tai_khoan (id);
ALTER TABLE dm_tai_khoan_vai_tro
    ADD CONSTRAINT fk_tai_khoan_vai_tro_vai_tro
    FOREIGN KEY (vai_tro_id)
    REFERENCES dm_vai_tro (id);
ALTER TABLE dm_thiet_lap_co_so
    ADD CONSTRAINT fk_thiet_lap_co_so_thiet_lap
    FOREIGN KEY (thiet_lap_id)
    REFERENCES dm_thiet_lap (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
ALTER TABLE dm_thiet_lap_co_so
    ADD CONSTRAINT fk_thiet_lap_co_so_co_so
    FOREIGN KEY (co_so_id)
    REFERENCES dm_co_so (id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;
ALTER TABLE dm_thiet_lap_nhom_tinh_nang
    ADD CONSTRAINT fk_thiet_lap_nhom_tinh_nang_thiet_lap
    FOREIGN KEY (thiet_lap_id)
    REFERENCES dm_thiet_lap(id);
ALTER TABLE dm_thiet_lap_nhom_tinh_nang
    ADD CONSTRAINT fk_thiet_lap_nhom_tinh_nang_nhom
    FOREIGN KEY (nhom_tinh_nang_id)
    REFERENCES dm_nhom_tinh_nang(id);
ALTER TABLE dm_thuc_pham
    ADD CONSTRAINT fk_tp_dv_so_cap
    FOREIGN KEY (don_vi_so_cap_id)
    REFERENCES dm_don_vi_tinh (id);
ALTER TABLE dm_thuc_pham
    ADD CONSTRAINT fk_tp_dv_su_dung
    FOREIGN KEY (don_vi_su_dung_id)
    REFERENCES dm_don_vi_tinh (id);
ALTER TABLE dm_thuc_pham
    ADD CONSTRAINT fk_thuc_pham_xuat_xu
    FOREIGN KEY (xuat_xu_id)
    REFERENCES dm_quoc_gia(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;
ALTER TABLE dm_tinh_thanh
    ADD CONSTRAINT fk_tinh_thanh_quoc_gia
    FOREIGN KEY (quoc_gia_id)
    REFERENCES dm_quoc_gia (id);
ALTER TABLE dm_vai_tro_quyen
    ADD CONSTRAINT fk_vai_tro_quyen_vai_tro
    FOREIGN KEY (vai_tro_id)
    REFERENCES dm_vai_tro (id);
ALTER TABLE dm_vai_tro_quyen
    ADD CONSTRAINT fk_vai_tro_quyen_quyen
    FOREIGN KEY (quyen_id)
    REFERENCES dm_quyen (id);
ALTER TABLE dm_xa_phuong
    ADD CONSTRAINT fk_xa_phuong_tinh_thanh
    FOREIGN KEY (tinh_thanh_id)
    REFERENCES dm_tinh_thanh (id);
ALTER TABLE nv_phieu_nhap
    ADD CONSTRAINT fk_phieu_nhap_kho
    FOREIGN KEY (kho_id)
    REFERENCES dm_kho (id);
ALTER TABLE nv_phieu_nhap
    ADD CONSTRAINT fk_phieu_nhap_nhan_vien
    FOREIGN KEY (nhan_vien_id)
    REFERENCES dm_nhan_vien (id);
ALTER TABLE nv_phieu_xuat
    ADD CONSTRAINT fk_px_kho
    FOREIGN KEY (kho_id)
    REFERENCES dm_kho (id);
ALTER TABLE nv_phieu_xuat
    ADD CONSTRAINT fk_px_nv
    FOREIGN KEY (nhan_vien_id)
    REFERENCES dm_nhan_vien (id);
ALTER TABLE nv_refresh_token
    ADD CONSTRAINT fk_refresh_token_tai_khoan
    FOREIGN KEY (tai_khoan_id)
    REFERENCES dm_tai_khoan (id);
ALTER TABLE nv_thong_bao
    ADD CONSTRAINT fk_nv_thong_bao_nguoi_tao
    FOREIGN KEY (nguoi_tao_id)
    REFERENCES dm_tai_khoan (id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
ALTER TABLE ct_thong_bao_doi_tuong
    ADD CONSTRAINT fk_ct_thong_bao_doi_tuong_thong_bao
    FOREIGN KEY (thong_bao_id)
    REFERENCES nv_thong_bao (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
ALTER TABLE ct_thong_bao_nguoi_nhan
    ADD CONSTRAINT fk_ct_thong_bao_nguoi_nhan_thong_bao
    FOREIGN KEY (thong_bao_id)
    REFERENCES nv_thong_bao (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
ALTER TABLE ct_thong_bao_nguoi_nhan
    ADD CONSTRAINT fk_ct_thong_bao_nguoi_nhan_tai_khoan
    FOREIGN KEY (tai_khoan_id)
    REFERENCES dm_tai_khoan (id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
ALTER TABLE nv_thuc_don
    ADD CONSTRAINT fk_nv_thuc_don_co_so
    FOREIGN KEY (co_so_id)
    REFERENCES dm_co_so (id);
ALTER TABLE nv_thuc_don
    ADD CONSTRAINT fk_nv_thuc_don_nha_an
    FOREIGN KEY (nha_an_id)
    REFERENCES dm_nha_an (id);
ALTER TABLE nv_thuc_don
    ADD CONSTRAINT fk_nv_thuc_don_ca_an
    FOREIGN KEY (ca_an_id)
    REFERENCES dm_ca_an (id);
ALTER TABLE ct_thuc_don_ngay
    ADD CONSTRAINT fk_ct_thuc_don_ngay_thuc_don
    FOREIGN KEY (thuc_don_id)
    REFERENCES nv_thuc_don (id)
    ON DELETE CASCADE;
ALTER TABLE ct_thuc_don_nhom_mon_an
    ADD CONSTRAINT fk_ct_thuc_don_nhom_mon_an_ngay
    FOREIGN KEY (thuc_don_ngay_id)
    REFERENCES ct_thuc_don_ngay (id)
    ON DELETE CASCADE;
ALTER TABLE ct_thuc_don_nhom_mon_an
    ADD CONSTRAINT fk_ct_thuc_don_nhom_mon_an_nhom
    FOREIGN KEY (nhom_mon_an_id)
    REFERENCES dm_nhom_mon_an (id);
ALTER TABLE ct_thuc_don_mon_an
    ADD CONSTRAINT fk_ct_thuc_don_mon_an_nhom
    FOREIGN KEY (thuc_don_nhom_mon_an_id)
    REFERENCES ct_thuc_don_nhom_mon_an (id)
    ON DELETE CASCADE;
ALTER TABLE ct_thuc_don_mon_an
    ADD CONSTRAINT fk_ct_thuc_don_mon_an_mon_an
    FOREIGN KEY (mon_an_id)
    REFERENCES dm_mon_an (id);
ALTER TABLE ct_thuc_don_mon_an
    ADD CONSTRAINT fk_ct_thuc_don_mon_an_don_vi_tinh
    FOREIGN KEY (don_vi_tinh_id)
    REFERENCES dm_don_vi_tinh (id);
ALTER TABLE ton_kho
    ADD CONSTRAINT fk_ton_kho
    FOREIGN KEY (kho_id)
    REFERENCES dm_kho (id);
ALTER TABLE ton_kho
    ADD CONSTRAINT fk_ton_tp
    FOREIGN KEY (thuc_pham_id)
    REFERENCES dm_thuc_pham (id);
ALTER TABLE ton_kho
    ADD CONSTRAINT fk_ton_kho_last_pn
    FOREIGN KEY (last_phieu_nhap_id)
    REFERENCES nv_phieu_nhap (id);
ALTER TABLE ton_kho
    ADD CONSTRAINT fk_ton_kho_last_px
    FOREIGN KEY (last_phieu_xuat_id)
    REFERENCES nv_phieu_xuat (id);
CREATE OR REPLACE VIEW dm_dia_chi AS
SELECT
    xp.id AS id,
    xp.ma_xa_phuong AS ma_dia_chi,
    CONCAT_WS(
        ', ',
        xp.ten_xa_phuong,
        tt.ten_tinh_thanh,
        qg.ten_quoc_gia
    ) AS ten_dia_chi,
    qg.id AS quoc_gia_id,
    qg.ma_quoc_gia,
    qg.ten_quoc_gia,
    qg.ten_tieng_anh,
    qg.ten_viet_tat AS quoc_gia_ten_viet_tat,
    qg.ma_dien_thoai,
    qg.ma_iso2,
    qg.ma_iso3,
    qg.active AS quoc_gia_active,
    tt.id AS tinh_thanh_id,
    tt.ma_tinh_thanh,
    tt.ten_tinh_thanh,
    tt.ten_viet_tat AS tinh_thanh_ten_viet_tat,
    tt.active AS tinh_thanh_active,
    xp.id AS xa_phuong_id,
    xp.ma_xa_phuong,
    xp.ten_xa_phuong,
    xp.ten_viet_tat AS xa_phuong_ten_viet_tat,
    xp.active AS xa_phuong_active,
    (
        qg.active = true
        AND tt.active = true
        AND xp.active = true
    ) AS active
FROM dm_xa_phuong xp
INNER JOIN dm_tinh_thanh tt
    ON tt.id = xp.tinh_thanh_id
INNER JOIN dm_quoc_gia qg
    ON qg.id = tt.quoc_gia_id;
-- Index hỗ trợ truy vấn
CREATE INDEX idx_dm_gia_ve_an_lookup
    ON dm_gia_ve_an (doi_tuong_lay_ve, co_so_id, nha_an_id, ca_an_id, tu_ngay, den_ngay)
    WHERE active = TRUE;
CREATE UNIQUE INDEX uq_nv_thanh_toan_ve_an_ma_giao_dich
    ON nv_thanh_toan_ve_an (ma_giao_dich)
    WHERE ma_giao_dich IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_nv_phieu_lay_ve_an_phieu_goc
    ON nv_phieu_lay_ve_an(phieu_goc_id);
CREATE INDEX IF NOT EXISTS idx_nv_thanh_toan_ve_an_thanh_toan_goc
    ON nv_thanh_toan_ve_an(thanh_toan_goc_id);
CREATE INDEX IF NOT EXISTS idx_nv_thanh_toan_ve_an_phieu_moi
    ON nv_thanh_toan_ve_an(phieu_moi_id);
CREATE UNIQUE INDEX uq_nv_dot_binh_chon_thuc_don_ngay_hieu_luc
    ON nv_dot_binh_chon (thuc_don_ngay_id)
    WHERE trang_thai <> 30;
CREATE INDEX idx_nv_dot_binh_chon_thuc_don_ngay
    ON nv_dot_binh_chon (thuc_don_ngay_id);
CREATE INDEX idx_nv_dot_binh_chon_trang_thai_thoi_gian
    ON nv_dot_binh_chon (trang_thai, bat_dau_binh_chon, han_binh_chon);
CREATE INDEX idx_ct_binh_chon_suat_an_tai_khoan
    ON ct_binh_chon_suat_an (tai_khoan_id);
CREATE INDEX idx_ct_binh_chon_suat_an_dot_lua_chon
    ON ct_binh_chon_suat_an (dot_binh_chon_id, lua_chon);
CREATE INDEX idx_ct_cscv_chuc_vu
    ON ct_chinh_sach_chuc_vu (chuc_vu_id);
CREATE INDEX idx_ct_cstk_tai_khoan
    ON ct_chinh_sach_tai_khoan (tai_khoan_id);
CREATE INDEX idx_ct_csvt_vai_tro
    ON ct_chinh_sach_vai_tro (vai_tro_id);
CREATE INDEX idx_ct_knvql_kho
    ON ct_kho_nhan_vien_quan_ly (kho_id);
CREATE INDEX idx_ct_knvql_nhan_vien
    ON ct_kho_nhan_vien_quan_ly (nhan_vien_id);
CREATE INDEX idx_dm_chinh_sach_active
    ON dm_chinh_sach (active);
CREATE INDEX idx_dm_chinh_sach_loai
    ON dm_chinh_sach (loai_chinh_sach);
CREATE INDEX idx_ct_csv_voucher
    ON ct_chinh_sach_voucher (voucher_id);
CREATE INDEX idx_quyen_nhom_nhom_tinh_nang_id
    ON dm_quyen_nhom_tinh_nang (nhom_tinh_nang_id);
CREATE INDEX idx_quyen_nhom_quyen_id
    ON dm_quyen_nhom_tinh_nang (quyen_id);
CREATE INDEX idx_nv_thuc_don_co_so_id
    ON nv_thuc_don (co_so_id);
CREATE INDEX idx_nv_thuc_don_nha_an_id
    ON nv_thuc_don (nha_an_id);
CREATE INDEX idx_nv_thuc_don_ca_an_id
    ON nv_thuc_don (ca_an_id);
CREATE INDEX idx_nv_thuc_don_tu_ngay
    ON nv_thuc_don (tu_ngay);
CREATE INDEX idx_nv_thuc_don_den_ngay
    ON nv_thuc_don (den_ngay);
CREATE INDEX idx_nv_thuc_don_trang_thai
    ON nv_thuc_don (trang_thai);
CREATE INDEX idx_ct_thuc_don_ngay_thuc_don_id
    ON ct_thuc_don_ngay (thuc_don_id);
CREATE INDEX idx_ct_thuc_don_ngay_ngay
    ON ct_thuc_don_ngay (ngay);
CREATE INDEX idx_ct_thuc_don_nhom_mon_an_ngay_id
    ON ct_thuc_don_nhom_mon_an (thuc_don_ngay_id);
CREATE INDEX idx_ct_thuc_don_nhom_mon_an_nhom_id
    ON ct_thuc_don_nhom_mon_an (nhom_mon_an_id);
CREATE INDEX idx_ct_thuc_don_mon_an_nhom_id
    ON ct_thuc_don_mon_an (thuc_don_nhom_mon_an_id);
CREATE INDEX idx_ct_thuc_don_mon_an_mon_an_id
    ON ct_thuc_don_mon_an (mon_an_id);
CREATE INDEX idx_ct_thuc_don_mon_an_don_vi_tinh_id
    ON ct_thuc_don_mon_an (don_vi_tinh_id);
CREATE INDEX idx_dm_thiet_lap_co_so_thiet_lap_id
    ON dm_thiet_lap_co_so (thiet_lap_id);
CREATE INDEX idx_dm_thiet_lap_co_so_co_so_id
    ON dm_thiet_lap_co_so (co_so_id);
CREATE INDEX idx_dm_thiet_lap_nhom_tinh_nang_thiet_lap_id
    ON dm_thiet_lap_nhom_tinh_nang (thiet_lap_id);
CREATE INDEX idx_dm_thiet_lap_nhom_tinh_nang_nhom_tinh_nang_id
    ON dm_thiet_lap_nhom_tinh_nang (nhom_tinh_nang_id);
CREATE INDEX idx_ct_thong_bao_doi_tuong_lookup
    ON ct_thong_bao_doi_tuong (loai_doi_tuong, doi_tuong_id);
CREATE INDEX idx_ct_thong_bao_nguoi_nhan_tai_khoan
    ON ct_thong_bao_nguoi_nhan (tai_khoan_id);
CREATE INDEX idx_ct_thong_bao_nguoi_nhan_chua_doc
    ON ct_thong_bao_nguoi_nhan (tai_khoan_id)
    WHERE da_doc = FALSE;
CREATE INDEX idx_nv_thong_bao_thoi_gian_gui
    ON nv_thong_bao (thoi_gian_gui DESC);
    
-- Trigger tự động cập nhật updated_at
CREATE TRIGGER trg_dm_gia_ve_an_updated_at
BEFORE UPDATE ON dm_gia_ve_an
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_nv_phieu_lay_ve_an_updated_at
BEFORE UPDATE ON nv_phieu_lay_ve_an
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_ct_phieu_lay_ve_mien_giam_updated_at
BEFORE UPDATE ON ct_phieu_lay_ve_mien_giam
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_nv_thanh_toan_ve_an_updated_at
BEFORE UPDATE ON nv_thanh_toan_ve_an
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_ct_ve_an_updated_at
BEFORE UPDATE ON ct_ve_an
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_nv_thuc_don_updated_at
BEFORE UPDATE ON nv_thuc_don
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_ct_thuc_don_ngay_updated_at
BEFORE UPDATE ON ct_thuc_don_ngay
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_ct_thuc_don_nhom_mon_an_updated_at
BEFORE UPDATE ON ct_thuc_don_nhom_mon_an
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_ct_thuc_don_mon_an_updated_at
BEFORE UPDATE ON ct_thuc_don_mon_an
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_ct_phieu_nhap_updated_at
BEFORE UPDATE ON ct_phieu_nhap
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_ct_phieu_xuat_updated_at
BEFORE UPDATE ON ct_phieu_xuat
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_dm_thiet_lap_updated_at
BEFORE UPDATE ON dm_thiet_lap
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_dm_thiet_lap_co_so_updated_at
BEFORE UPDATE ON dm_thiet_lap_co_so
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_dm_thiet_lap_nhom_tinh_nang_updated_at
BEFORE UPDATE ON dm_thiet_lap_nhom_tinh_nang
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_nv_phieu_nhap_updated_at
BEFORE UPDATE ON nv_phieu_nhap
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_nv_phieu_xuat_updated_at
BEFORE UPDATE ON nv_phieu_xuat
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_ton_kho_updated_at
BEFORE UPDATE ON ton_kho
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_nv_dot_binh_chon_updated_at
BEFORE UPDATE ON nv_dot_binh_chon
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_ct_binh_chon_suat_an_updated_at
BEFORE UPDATE ON ct_binh_chon_suat_an
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
CREATE TABLE dm_nhom_san_pham (
    id BIGSERIAL PRIMARY KEY,
    ma_nhom_san_pham VARCHAR(50) NOT NULL UNIQUE,
    ten_nhom_san_pham VARCHAR(150) NOT NULL,
    loai_san_pham INTEGER NOT NULL,
    mo_ta VARCHAR(500),
    thu_tu_hien_thi INTEGER DEFAULT 0 NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_dm_nhom_san_pham_loai
        CHECK (loai_san_pham IN (10, 20, 30, 40))
);

COMMENT ON COLUMN dm_nhom_san_pham.loai_san_pham IS
'10=Do an, 20=Do uong, 30=Trang mieng, 40=Dich vu khac';

CREATE TABLE dm_san_pham (
    id BIGSERIAL PRIMARY KEY,
    ma_san_pham VARCHAR(50) NOT NULL UNIQUE,
    ten_san_pham VARCHAR(255) NOT NULL,
    nhom_san_pham_id BIGINT NOT NULL REFERENCES dm_nhom_san_pham(id),
    mon_an_id INTEGER REFERENCES dm_mon_an(id),
    don_vi_tinh_id INTEGER REFERENCES dm_don_vi_tinh(id),
    gia_ban NUMERIC(18, 6) DEFAULT 0 NOT NULL,
    mo_ta VARCHAR(500),
    hinh_anh TEXT,
    cho_phep_dat BOOLEAN DEFAULT TRUE NOT NULL,
    la_san_pham_moi BOOLEAN DEFAULT FALSE NOT NULL,
    la_san_pham_noi_bat BOOLEAN DEFAULT FALSE NOT NULL,
    so_luong_toi_thieu NUMERIC(18, 6) DEFAULT 1 NOT NULL,
    so_luong_toi_da NUMERIC(18, 6),
    buoc_so_luong NUMERIC(18, 6) DEFAULT 1 NOT NULL,
    thoi_gian_chuan_bi_phut INTEGER DEFAULT 0 NOT NULL,
    thu_tu_hien_thi INTEGER DEFAULT 0 NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_dm_san_pham_gia CHECK (gia_ban >= 0),
    CONSTRAINT chk_dm_san_pham_so_luong CHECK (
        so_luong_toi_thieu > 0
        AND buoc_so_luong > 0
        AND (so_luong_toi_da IS NULL OR so_luong_toi_da >= so_luong_toi_thieu)
    ),
    CONSTRAINT chk_dm_san_pham_chuan_bi CHECK (thoi_gian_chuan_bi_phut >= 0)
);

CREATE TABLE ct_san_pham_co_so (
    id BIGSERIAL PRIMARY KEY,
    san_pham_id BIGINT NOT NULL REFERENCES dm_san_pham(id),
    co_so_id INTEGER NOT NULL REFERENCES dm_co_so(id),
    gia_ban NUMERIC(18, 6),
    so_luong_toi_da_moi_don NUMERIC(18, 6),
    cho_phep_dat BOOLEAN DEFAULT TRUE NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_ct_san_pham_co_so UNIQUE (san_pham_id, co_so_id),
    CONSTRAINT chk_ct_san_pham_co_so_gia CHECK (gia_ban IS NULL OR gia_ban >= 0),
    CONSTRAINT chk_ct_san_pham_co_so_so_luong
        CHECK (so_luong_toi_da_moi_don IS NULL OR so_luong_toi_da_moi_don > 0)
);
CREATE TABLE dm_dia_diem_nhan_hang (
    id BIGSERIAL PRIMARY KEY,
    ma_dia_diem VARCHAR(50) NOT NULL,
    ten_dia_diem VARCHAR(255) NOT NULL,
    co_so_id INTEGER NOT NULL REFERENCES dm_co_so(id),
    mo_ta_dia_chi VARCHAR(500),
    thu_tu_hien_thi INTEGER DEFAULT 0 NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_dm_dia_diem_nhan_hang UNIQUE (co_so_id, ma_dia_diem)
);

CREATE TABLE dm_khung_gio_nhan_hang (
    id BIGSERIAL PRIMARY KEY,
    ma_khung_gio VARCHAR(50) NOT NULL,
    ten_khung_gio VARCHAR(150) NOT NULL,
    co_so_id INTEGER NOT NULL REFERENCES dm_co_so(id),
    gio_bat_dau TIME NOT NULL,
    gio_ket_thuc TIME NOT NULL,
    han_dat_truoc_phut INTEGER DEFAULT 0 NOT NULL,
    so_don_toi_da INTEGER,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_dm_khung_gio_nhan_hang UNIQUE (co_so_id, ma_khung_gio),
    CONSTRAINT chk_dm_khung_gio_nhan_hang_gio CHECK (gio_bat_dau < gio_ket_thuc),
    CONSTRAINT chk_dm_khung_gio_nhan_hang_han CHECK (han_dat_truoc_phut >= 0),
    CONSTRAINT chk_dm_khung_gio_nhan_hang_so_don CHECK (so_don_toi_da IS NULL OR so_don_toi_da > 0)
);
CREATE TABLE dm_voucher_don_hang (
    id BIGSERIAL PRIMARY KEY,
    ma_voucher VARCHAR(50) NOT NULL UNIQUE,
    ten_voucher VARCHAR(255) NOT NULL,
    mo_ta VARCHAR(1000),
    loai_giam INTEGER NOT NULL,
    gia_tri NUMERIC(18, 6) NOT NULL,
    giam_toi_da NUMERIC(18, 6),
    gia_tri_don_hang_toi_thieu NUMERIC(18, 6) DEFAULT 0 NOT NULL,
    so_luong_phat_hanh INTEGER,
    so_luot_moi_nhan_vien INTEGER DEFAULT 1,
    pham_vi_ap_dung INTEGER DEFAULT 10 NOT NULL,
    cho_phep_dung_chung BOOLEAN DEFAULT FALSE NOT NULL,
    tu_dong_ap_dung BOOLEAN DEFAULT FALSE NOT NULL,
    thoi_gian_bat_dau TIMESTAMP NOT NULL,
    thoi_gian_ket_thuc TIMESTAMP NOT NULL,
    nguoi_tao_id INTEGER NOT NULL REFERENCES dm_nhan_vien(id),
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_dm_voucher_don_hang_loai CHECK (loai_giam IN (10, 20, 30)),
    CONSTRAINT chk_dm_voucher_don_hang_pham_vi CHECK (pham_vi_ap_dung IN (10, 20, 30)),
    CONSTRAINT chk_dm_voucher_don_hang_gia_tri CHECK (
        gia_tri > 0
        AND gia_tri_don_hang_toi_thieu >= 0
        AND (giam_toi_da IS NULL OR giam_toi_da >= 0)
    ),
    CONSTRAINT chk_dm_voucher_don_hang_phan_tram CHECK (loai_giam <> 10 OR gia_tri <= 100),
    CONSTRAINT chk_dm_voucher_don_hang_so_luong CHECK (so_luong_phat_hanh IS NULL OR so_luong_phat_hanh > 0),
    CONSTRAINT chk_dm_voucher_don_hang_luot CHECK (so_luot_moi_nhan_vien IS NULL OR so_luot_moi_nhan_vien > 0),
    CONSTRAINT chk_dm_voucher_don_hang_thoi_gian CHECK (thoi_gian_bat_dau < thoi_gian_ket_thuc)
);

COMMENT ON COLUMN dm_voucher_don_hang.loai_giam IS
'10=Phan tram, 20=So tien co dinh, 30=Mien phi dich vu';
COMMENT ON COLUMN dm_voucher_don_hang.pham_vi_ap_dung IS
'10=Toan don, 20=Nhom san pham, 30=San pham cu the';

CREATE TABLE ct_voucher_don_hang_nhom_san_pham (
    voucher_don_hang_id BIGINT NOT NULL REFERENCES dm_voucher_don_hang(id) ON DELETE CASCADE,
    nhom_san_pham_id BIGINT NOT NULL REFERENCES dm_nhom_san_pham(id),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    PRIMARY KEY (voucher_don_hang_id, nhom_san_pham_id)
);

CREATE TABLE ct_voucher_don_hang_san_pham (
    voucher_don_hang_id BIGINT NOT NULL REFERENCES dm_voucher_don_hang(id) ON DELETE CASCADE,
    san_pham_id BIGINT NOT NULL REFERENCES dm_san_pham(id),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    PRIMARY KEY (voucher_don_hang_id, san_pham_id)
);

CREATE TABLE ct_voucher_don_hang_co_so (
    voucher_don_hang_id BIGINT NOT NULL REFERENCES dm_voucher_don_hang(id) ON DELETE CASCADE,
    co_so_id INTEGER NOT NULL REFERENCES dm_co_so(id),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    PRIMARY KEY (voucher_don_hang_id, co_so_id)
);

CREATE TABLE ct_voucher_don_hang_phong_ban (
    voucher_don_hang_id BIGINT NOT NULL REFERENCES dm_voucher_don_hang(id) ON DELETE CASCADE,
    phong_ban_id INTEGER NOT NULL REFERENCES dm_phong_ban(id),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    PRIMARY KEY (voucher_don_hang_id, phong_ban_id)
);

CREATE TABLE ct_voucher_don_hang_chuc_vu (
    voucher_don_hang_id BIGINT NOT NULL REFERENCES dm_voucher_don_hang(id) ON DELETE CASCADE,
    chuc_vu_id INTEGER NOT NULL REFERENCES dm_chuc_vu(id),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    PRIMARY KEY (voucher_don_hang_id, chuc_vu_id)
);

CREATE TABLE ct_voucher_don_hang_nhan_vien (
    voucher_don_hang_id BIGINT NOT NULL REFERENCES dm_voucher_don_hang(id) ON DELETE CASCADE,
    nhan_vien_id INTEGER NOT NULL REFERENCES dm_nhan_vien(id),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    PRIMARY KEY (voucher_don_hang_id, nhan_vien_id)
);
CREATE TABLE nv_don_hang (
    id BIGSERIAL PRIMARY KEY,
    ma_don_hang VARCHAR(50) NOT NULL UNIQUE,
    nguoi_dat_id INTEGER NOT NULL REFERENCES dm_nhan_vien(id),
    phong_ban_id INTEGER REFERENCES dm_phong_ban(id),
    co_so_id INTEGER NOT NULL REFERENCES dm_co_so(id),
    dat_ho BOOLEAN DEFAULT FALSE NOT NULL,
    nguoi_nhan_id INTEGER REFERENCES dm_nhan_vien(id),
    ten_nguoi_nhan VARCHAR(150) NOT NULL,
    so_dien_thoai_nguoi_nhan VARCHAR(20) NOT NULL,
    dia_diem_nhan_id BIGINT REFERENCES dm_dia_diem_nhan_hang(id),
    dia_chi_nhan_snapshot VARCHAR(500) NOT NULL,
    khung_gio_nhan_id BIGINT REFERENCES dm_khung_gio_nhan_hang(id),
    thoi_gian_nhan_tu TIMESTAMP NOT NULL,
    thoi_gian_nhan_den TIMESTAMP NOT NULL,
    ghi_chu VARCHAR(1000),
    tam_tinh NUMERIC(18, 6) DEFAULT 0 NOT NULL,
    tong_mien_giam NUMERIC(18, 6) DEFAULT 0 NOT NULL,
    phi_dich_vu NUMERIC(18, 6) DEFAULT 0 NOT NULL,
    tong_thanh_toan NUMERIC(18, 6) DEFAULT 0 NOT NULL,
    phuong_thuc_thanh_toan INTEGER NOT NULL,
    trang_thai_thanh_toan INTEGER DEFAULT 10 NOT NULL,
    trang_thai INTEGER DEFAULT 20 NOT NULL,
    nguoi_xu_ly_id INTEGER REFERENCES dm_nhan_vien(id),
    thoi_gian_tiep_nhan TIMESTAMP,
    nguoi_huy_id INTEGER REFERENCES dm_nhan_vien(id),
    thoi_gian_huy TIMESTAMP,
    ly_do_huy VARCHAR(500),
    version INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_nv_don_hang_thoi_gian CHECK (thoi_gian_nhan_tu < thoi_gian_nhan_den),
    CONSTRAINT chk_nv_don_hang_tien CHECK (
        tam_tinh >= 0 AND tong_mien_giam >= 0 AND phi_dich_vu >= 0
        AND tong_thanh_toan >= 0 AND tong_mien_giam <= tam_tinh
        AND tong_thanh_toan = tam_tinh - tong_mien_giam + phi_dich_vu
    ),
    CONSTRAINT chk_nv_don_hang_phuong_thuc CHECK (phuong_thuc_thanh_toan IN (10, 20, 30, 40)),
    CONSTRAINT chk_nv_don_hang_thanh_toan CHECK (trang_thai_thanh_toan IN (10, 20, 30, 40, 50)),
    CONSTRAINT chk_nv_don_hang_trang_thai CHECK (trang_thai IN (-20, -10, 10, 20, 30, 40, 50, 60, 70)),
    CONSTRAINT chk_nv_don_hang_version CHECK (version > 0)
);

COMMENT ON COLUMN nv_don_hang.phuong_thuc_thanh_toan IS
'10=Noi bo, 20=Tien mat, 30=Chuyen khoan, 40=QR';
COMMENT ON COLUMN nv_don_hang.trang_thai_thanh_toan IS
'10=Chua thanh toan, 20=Cho thanh toan, 30=Da thanh toan, 40=That bai, 50=Da hoan tien';
COMMENT ON COLUMN nv_don_hang.trang_thai IS
'-20=Tu choi, -10=Da huy, 10=Nhap, 20=Cho xac nhan, 30=Dang chuan bi, 40=San sang giao, 50=Dang giao, 60=Hoan thanh, 70=Dong don';

CREATE TABLE ct_don_hang (
    id BIGSERIAL PRIMARY KEY,
    don_hang_id BIGINT NOT NULL REFERENCES nv_don_hang(id),
    san_pham_id BIGINT NOT NULL REFERENCES dm_san_pham(id),
    ma_san_pham_snapshot VARCHAR(50) NOT NULL,
    ten_san_pham_snapshot VARCHAR(255) NOT NULL,
    ten_nhom_snapshot VARCHAR(150),
    don_vi_snapshot VARCHAR(100),
    hinh_anh_snapshot TEXT,
    so_luong NUMERIC(18, 6) NOT NULL,
    don_gia NUMERIC(18, 6) NOT NULL,
    tien_giam NUMERIC(18, 6) DEFAULT 0 NOT NULL,
    thanh_tien NUMERIC(18, 6) NOT NULL,
    ghi_chu VARCHAR(500),
    trang_thai INTEGER DEFAULT 10 NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_ct_don_hang_so_luong CHECK (so_luong > 0),
    CONSTRAINT chk_ct_don_hang_tien CHECK (
        don_gia >= 0 AND tien_giam >= 0 AND thanh_tien >= 0
        AND tien_giam <= so_luong * don_gia
        AND thanh_tien = so_luong * don_gia - tien_giam
    ),
    CONSTRAINT chk_ct_don_hang_trang_thai CHECK (trang_thai IN (-10, 10, 20, 30))
);

COMMENT ON COLUMN ct_don_hang.trang_thai IS
'-10=Huy dong, 10=Cho xu ly, 20=Dang chuan bi, 30=Hoan thanh';
CREATE TABLE ct_don_hang_voucher (
    id BIGSERIAL PRIMARY KEY,
    don_hang_id BIGINT NOT NULL REFERENCES nv_don_hang(id),
    voucher_don_hang_id BIGINT NOT NULL REFERENCES dm_voucher_don_hang(id),
    ma_voucher_snapshot VARCHAR(50) NOT NULL,
    ten_voucher_snapshot VARCHAR(255) NOT NULL,
    loai_giam_snapshot INTEGER NOT NULL,
    gia_tri_snapshot NUMERIC(18, 6) NOT NULL,
    so_tien_du_dieu_kien NUMERIC(18, 6) NOT NULL,
    so_tien_giam NUMERIC(18, 6) NOT NULL,
    thu_tu_ap_dung INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_ct_don_hang_voucher UNIQUE (don_hang_id, voucher_don_hang_id),
    CONSTRAINT chk_ct_don_hang_voucher_loai CHECK (loai_giam_snapshot IN (10, 20, 30)),
    CONSTRAINT chk_ct_don_hang_voucher_tien CHECK (
        gia_tri_snapshot > 0 AND so_tien_du_dieu_kien >= 0
        AND so_tien_giam >= 0 AND so_tien_giam <= so_tien_du_dieu_kien
    ),
    CONSTRAINT chk_ct_don_hang_voucher_thu_tu CHECK (thu_tu_ap_dung > 0)
);
CREATE TABLE nv_voucher_don_hang_su_dung (
    id BIGSERIAL PRIMARY KEY,
    voucher_don_hang_id BIGINT NOT NULL REFERENCES dm_voucher_don_hang(id),
    don_hang_id BIGINT NOT NULL REFERENCES nv_don_hang(id),
    nhan_vien_id INTEGER NOT NULL REFERENCES dm_nhan_vien(id),
    so_tien_giam NUMERIC(18, 6) NOT NULL,
    trang_thai INTEGER DEFAULT 10 NOT NULL,
    thoi_gian_giu TIMESTAMP DEFAULT NOW() NOT NULL,
    het_han_giu_luc TIMESTAMP,
    thoi_gian_su_dung TIMESTAMP,
    thoi_gian_hoan TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT uq_nv_voucher_don_hang_su_dung UNIQUE (voucher_don_hang_id, don_hang_id),
    CONSTRAINT chk_nv_voucher_don_hang_su_dung_tien CHECK (so_tien_giam >= 0),
    CONSTRAINT chk_nv_voucher_don_hang_su_dung_trang_thai CHECK (trang_thai IN (10, 20, 30))
);

COMMENT ON COLUMN nv_voucher_don_hang_su_dung.trang_thai IS
'10=Giu cho, 20=Da su dung, 30=Da hoan luot';
CREATE TABLE nv_thanh_toan_don_hang (
    id BIGSERIAL PRIMARY KEY,
    don_hang_id BIGINT NOT NULL REFERENCES nv_don_hang(id),
    loai_giao_dich INTEGER NOT NULL,
    phuong_thuc INTEGER NOT NULL,
    so_tien NUMERIC(18, 6) NOT NULL,
    thanh_toan_goc_id BIGINT REFERENCES nv_thanh_toan_don_hang(id),
    ma_giao_dich VARCHAR(100),
    ma_tham_chieu VARCHAR(100),
    ma_chuan_chi VARCHAR(100),
    qr_payload TEXT,
    qr_het_han_luc TIMESTAMP,
    trang_thai INTEGER DEFAULT 10 NOT NULL,
    noi_dung_loi VARCHAR(1000),
    nguoi_khoi_tao_id INTEGER NOT NULL REFERENCES dm_nhan_vien(id),
    nguoi_xac_nhan_id INTEGER REFERENCES dm_nhan_vien(id),
    thoi_gian_thanh_toan TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_nv_thanh_toan_don_hang_loai CHECK (loai_giao_dich IN (10, 20)),
    CONSTRAINT chk_nv_thanh_toan_don_hang_phuong_thuc CHECK (phuong_thuc IN (10, 20, 30, 40)),
    CONSTRAINT chk_nv_thanh_toan_don_hang_trang_thai CHECK (trang_thai IN (10, 20, 30, 40, 50)),
    CONSTRAINT chk_nv_thanh_toan_don_hang_tien CHECK (so_tien >= 0)
);

COMMENT ON COLUMN nv_thanh_toan_don_hang.loai_giao_dich IS
'10=Thanh toan, 20=Hoan tien';
COMMENT ON COLUMN nv_thanh_toan_don_hang.trang_thai IS
'10=Khoi tao, 20=Cho xu ly, 30=Thanh cong, 40=That bai, 50=Da huy';
CREATE TABLE nv_lich_su_don_hang (
    id BIGSERIAL PRIMARY KEY,
    don_hang_id BIGINT NOT NULL REFERENCES nv_don_hang(id),
    trang_thai_cu INTEGER,
    trang_thai_moi INTEGER NOT NULL,
    hanh_dong VARCHAR(100) NOT NULL,
    noi_dung VARCHAR(500),
    nguoi_thuc_hien_id INTEGER REFERENCES dm_nhan_vien(id),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    CONSTRAINT chk_nv_lich_su_don_hang_trang_thai_cu CHECK (
        trang_thai_cu IS NULL OR trang_thai_cu IN (-20, -10, 10, 20, 30, 40, 50, 60, 70)
    ),
    CONSTRAINT chk_nv_lich_su_don_hang_trang_thai_moi CHECK (
        trang_thai_moi IN (-20, -10, 10, 20, 30, 40, 50, 60, 70)
    )
);
CREATE INDEX idx_dm_san_pham_nhom_active
    ON dm_san_pham(nhom_san_pham_id, active, thu_tu_hien_thi);

CREATE INDEX idx_ct_san_pham_co_so_ban
    ON ct_san_pham_co_so(co_so_id, cho_phep_dat, active);

CREATE INDEX idx_nv_don_hang_nguoi_dat
    ON nv_don_hang(nguoi_dat_id, created_at DESC);

CREATE INDEX idx_nv_don_hang_co_so_trang_thai
    ON nv_don_hang(co_so_id, trang_thai, created_at DESC);

CREATE INDEX idx_nv_don_hang_nguoi_xu_ly
    ON nv_don_hang(nguoi_xu_ly_id, trang_thai);

CREATE INDEX idx_nv_don_hang_thoi_gian_nhan
    ON nv_don_hang(thoi_gian_nhan_tu, thoi_gian_nhan_den);

CREATE INDEX idx_ct_don_hang_don_hang
    ON ct_don_hang(don_hang_id);

CREATE INDEX idx_nv_voucher_don_hang_nhan_vien
    ON nv_voucher_don_hang_su_dung(voucher_don_hang_id, nhan_vien_id, trang_thai);

CREATE INDEX idx_nv_thanh_toan_don_hang_don
    ON nv_thanh_toan_don_hang(don_hang_id, created_at DESC);

CREATE UNIQUE INDEX uq_nv_thanh_toan_don_hang_ma_giao_dich
    ON nv_thanh_toan_don_hang(ma_giao_dich)
    WHERE ma_giao_dich IS NOT NULL;

CREATE INDEX idx_nv_lich_su_don_hang_don
    ON nv_lich_su_don_hang(don_hang_id, created_at);

CREATE TRIGGER trg_dm_nhom_san_pham_updated_at
BEFORE UPDATE ON dm_nhom_san_pham
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_dm_san_pham_updated_at
BEFORE UPDATE ON dm_san_pham
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_ct_san_pham_co_so_updated_at
BEFORE UPDATE ON ct_san_pham_co_so
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_dm_dia_diem_nhan_hang_updated_at
BEFORE UPDATE ON dm_dia_diem_nhan_hang
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_dm_khung_gio_nhan_hang_updated_at
BEFORE UPDATE ON dm_khung_gio_nhan_hang
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_dm_voucher_don_hang_updated_at
BEFORE UPDATE ON dm_voucher_don_hang
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_nv_don_hang_updated_at
BEFORE UPDATE ON nv_don_hang
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_ct_don_hang_updated_at
BEFORE UPDATE ON ct_don_hang
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_nv_voucher_don_hang_su_dung_updated_at
BEFORE UPDATE ON nv_voucher_don_hang_su_dung
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_nv_thanh_toan_don_hang_updated_at
BEFORE UPDATE ON nv_thanh_toan_don_hang
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

COMMIT;
