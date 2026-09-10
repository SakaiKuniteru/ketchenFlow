--
-- PostgreSQL database dump
--

\restrict Ep3byRdBqrTbmuNn1Hr8vuClnAtVovnz4rjgJOURxmGkfYinRYVlGbFusKL1Yst

-- Dumped from database version 18.4 (Postgres.app)
-- Dumped by pg_dump version 18.4 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ct_binh_chon_suat_an; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_binh_chon_suat_an (
    binh_chon_id integer NOT NULL,
    mon_an_id integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ct_chinh_sach_chuc_vu; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_chinh_sach_chuc_vu (
    id bigint NOT NULL,
    chinh_sach_id bigint NOT NULL,
    chuc_vu_id bigint NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ct_chinh_sach_chuc_vu_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ct_chinh_sach_chuc_vu_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ct_chinh_sach_chuc_vu_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ct_chinh_sach_chuc_vu_id_seq OWNED BY public.ct_chinh_sach_chuc_vu.id;


--
-- Name: ct_chinh_sach_tai_khoan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_chinh_sach_tai_khoan (
    id bigint NOT NULL,
    chinh_sach_id bigint NOT NULL,
    tai_khoan_id bigint NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ct_chinh_sach_tai_khoan_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ct_chinh_sach_tai_khoan_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ct_chinh_sach_tai_khoan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ct_chinh_sach_tai_khoan_id_seq OWNED BY public.ct_chinh_sach_tai_khoan.id;


--
-- Name: ct_chinh_sach_vai_tro; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_chinh_sach_vai_tro (
    id bigint NOT NULL,
    chinh_sach_id bigint NOT NULL,
    vai_tro_id bigint NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ct_chinh_sach_vai_tro_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ct_chinh_sach_vai_tro_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ct_chinh_sach_vai_tro_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ct_chinh_sach_vai_tro_id_seq OWNED BY public.ct_chinh_sach_vai_tro.id;


--
-- Name: ct_chinh_sach_voucher; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_chinh_sach_voucher (
    chinh_sach_id bigint NOT NULL,
    voucher_id integer NOT NULL
);


--
-- Name: ct_dot_binh_chon_chinh_sach; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_dot_binh_chon_chinh_sach (
    dot_binh_chon_id integer NOT NULL,
    chinh_sach_id integer CONSTRAINT ct_dot_binh_chon_chinh_sach_chinh_sach_ho_tro_id_not_null NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ct_dot_binh_chon_chuc_vu; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_dot_binh_chon_chuc_vu (
    dot_binh_chon_id integer NOT NULL,
    chuc_vu_id integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ct_dot_binh_chon_mon_an; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_dot_binh_chon_mon_an (
    dot_binh_chon_id integer NOT NULL,
    mon_an_id integer NOT NULL,
    so_luong_du_kien integer,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ct_dot_binh_chon_nhom_mon; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_dot_binh_chon_nhom_mon (
    dot_binh_chon_id integer NOT NULL,
    nhom_mon_an_id integer NOT NULL,
    so_luong_duoc_chon integer NOT NULL,
    bat_buoc boolean DEFAULT false NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ct_kho_nhan_vien_quan_ly; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_kho_nhan_vien_quan_ly (
    id integer NOT NULL,
    kho_id integer NOT NULL,
    nhan_vien_id integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ct_kho_nhan_vien_quan_ly_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ct_kho_nhan_vien_quan_ly_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ct_kho_nhan_vien_quan_ly_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ct_kho_nhan_vien_quan_ly_id_seq OWNED BY public.ct_kho_nhan_vien_quan_ly.id;


--
-- Name: ct_mon_an_thuc_pham; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_mon_an_thuc_pham (
    id integer NOT NULL,
    mon_an_id integer NOT NULL,
    thuc_pham_id integer NOT NULL,
    dinh_luong numeric(12,3) NOT NULL,
    ghi_chu character varying(500),
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_ct_mon_an_thuc_pham_dinh_luong CHECK ((dinh_luong > (0)::numeric))
);


--
-- Name: ct_mon_an_thuc_pham_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ct_mon_an_thuc_pham_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ct_mon_an_thuc_pham_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ct_mon_an_thuc_pham_id_seq OWNED BY public.ct_mon_an_thuc_pham.id;


--
-- Name: ct_nha_an_nhan_vien; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_nha_an_nhan_vien (
    id bigint NOT NULL,
    nha_an_id integer NOT NULL,
    nhan_vien_id integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ct_nha_an_nhan_vien_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ct_nha_an_nhan_vien_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ct_nha_an_nhan_vien_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ct_nha_an_nhan_vien_id_seq OWNED BY public.ct_nha_an_nhan_vien.id;


--
-- Name: ct_phieu_nhap; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_phieu_nhap (
    id integer NOT NULL,
    phieu_nhap_id integer NOT NULL,
    thuc_pham_id integer NOT NULL,
    so_luong_nhap numeric(18,3) NOT NULL,
    don_gia numeric(18,2) NOT NULL,
    thanh_tien numeric(18,2) NOT NULL,
    han_su_dung date,
    so_lo character varying(100),
    ghi_chu text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    don_vi_so_cap_id integer,
    he_so_quy_doi numeric(18,3)
);


--
-- Name: ct_phieu_nhap_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ct_phieu_nhap_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ct_phieu_nhap_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ct_phieu_nhap_id_seq OWNED BY public.ct_phieu_nhap.id;


--
-- Name: ct_phieu_xuat; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_phieu_xuat (
    id integer NOT NULL,
    phieu_xuat_id integer NOT NULL,
    thuc_pham_id integer NOT NULL,
    so_luong_xuat numeric(18,3) NOT NULL,
    ghi_chu text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    don_vi_so_cap_id integer,
    he_so_quy_doi numeric(18,3)
);


--
-- Name: ct_phieu_xuat_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ct_phieu_xuat_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ct_phieu_xuat_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ct_phieu_xuat_id_seq OWNED BY public.ct_phieu_xuat.id;


--
-- Name: ct_thuc_don_mon_an; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_thuc_don_mon_an (
    id bigint NOT NULL,
    thuc_don_nhom_mon_an_id bigint NOT NULL,
    mon_an_id bigint NOT NULL,
    thu_tu_hien_thi integer,
    dinh_luong numeric(12,3),
    don_vi_tinh_id bigint,
    ghi_chu character varying(500),
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_ct_thuc_don_mon_an_dinh_luong CHECK (((dinh_luong IS NULL) OR (dinh_luong >= (0)::numeric))),
    CONSTRAINT chk_ct_thuc_don_mon_an_thu_tu CHECK (((thu_tu_hien_thi IS NULL) OR (thu_tu_hien_thi > 0)))
);


--
-- Name: ct_thuc_don_mon_an_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ct_thuc_don_mon_an_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ct_thuc_don_mon_an_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ct_thuc_don_mon_an_id_seq OWNED BY public.ct_thuc_don_mon_an.id;


--
-- Name: ct_thuc_don_ngay; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_thuc_don_ngay (
    id bigint NOT NULL,
    thuc_don_id bigint NOT NULL,
    ngay date NOT NULL,
    ghi_chu character varying(500),
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ct_thuc_don_ngay_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ct_thuc_don_ngay_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ct_thuc_don_ngay_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ct_thuc_don_ngay_id_seq OWNED BY public.ct_thuc_don_ngay.id;


--
-- Name: ct_thuc_don_nhom_mon_an; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_thuc_don_nhom_mon_an (
    id bigint NOT NULL,
    thuc_don_ngay_id bigint NOT NULL,
    nhom_mon_an_id bigint NOT NULL,
    thu_tu_hien_thi integer,
    ghi_chu character varying(500),
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_ct_thuc_don_nhom_mon_an_thu_tu CHECK (((thu_tu_hien_thi IS NULL) OR (thu_tu_hien_thi > 0)))
);


--
-- Name: ct_thuc_don_nhom_mon_an_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ct_thuc_don_nhom_mon_an_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ct_thuc_don_nhom_mon_an_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ct_thuc_don_nhom_mon_an_id_seq OWNED BY public.ct_thuc_don_nhom_mon_an.id;


--
-- Name: dm_bao_cao; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_bao_cao (
    id bigint NOT NULL,
    ma_bao_cao character varying(100) NOT NULL,
    ten_bao_cao character varying(255) NOT NULL,
    file_mau character varying(500),
    loai_xuat_file integer,
    mo_ta character varying(500),
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_dm_bao_cao_loai_xuat_file CHECK (((loai_xuat_file IS NULL) OR (loai_xuat_file = ANY (ARRAY[10, 20, 30]))))
);


--
-- Name: dm_bao_cao_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_bao_cao_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_bao_cao_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_bao_cao_id_seq OWNED BY public.dm_bao_cao.id;


--
-- Name: dm_ca_an; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_ca_an (
    id integer NOT NULL,
    ma_ca_an character varying(50) NOT NULL,
    ten_ca_an character varying(100) NOT NULL,
    thoi_gian_bat_dau time without time zone CONSTRAINT dm_ca_an_gio_bat_dau_not_null NOT NULL,
    thoi_gian_ket_thuc time without time zone CONSTRAINT dm_ca_an_gio_ket_thuc_not_null NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: dm_ca_an_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_ca_an_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_ca_an_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_ca_an_id_seq OWNED BY public.dm_ca_an.id;


--
-- Name: dm_chinh_sach; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_chinh_sach (
    id bigint NOT NULL,
    ma_chinh_sach character varying(50) NOT NULL,
    ten_chinh_sach character varying(255) NOT NULL,
    loai_chinh_sach integer NOT NULL,
    mo_ta character varying(500),
    muc_do_uu_tien integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_dm_chinh_sach_loai CHECK ((loai_chinh_sach = ANY (ARRAY[10, 20, 30]))),
    CONSTRAINT chk_dm_chinh_sach_uu_tien CHECK ((muc_do_uu_tien >= 0))
);


--
-- Name: dm_chinh_sach_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_chinh_sach_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_chinh_sach_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_chinh_sach_id_seq OWNED BY public.dm_chinh_sach.id;


--
-- Name: dm_chuc_vu; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_chuc_vu (
    id integer NOT NULL,
    ma_chuc_vu character varying(50) NOT NULL,
    ten_chuc_vu character varying(100) NOT NULL,
    mo_ta character varying(500),
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: dm_chuc_vu_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_chuc_vu_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_chuc_vu_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_chuc_vu_id_seq OWNED BY public.dm_chuc_vu.id;


--
-- Name: dm_co_so; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_co_so (
    id integer NOT NULL,
    ma_co_so character varying(50) NOT NULL,
    ten_co_so character varying(150) NOT NULL,
    dia_chi text,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    logo character varying(500),
    favicon character varying(500),
    quoc_gia_id integer,
    tinh_thanh_id integer,
    xa_phuong_id integer,
    logo_doi_tac character varying(500)
);


--
-- Name: dm_co_so_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_co_so_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_co_so_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_co_so_id_seq OWNED BY public.dm_co_so.id;


--
-- Name: dm_quoc_gia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_quoc_gia (
    id integer NOT NULL,
    ma_quoc_gia character varying(10) NOT NULL,
    ten_quoc_gia character varying(255) NOT NULL,
    ten_tieng_anh character varying(255),
    ma_dien_thoai character varying(10),
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    ten_viet_tat character varying(50),
    ma_iso2 character varying(2),
    ma_iso3 character varying(3),
    ten_quoc_gia_en character varying(255)
);


--
-- Name: dm_tinh_thanh; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_tinh_thanh (
    id integer NOT NULL,
    ma_tinh_thanh character varying(20) NOT NULL,
    ten_tinh_thanh character varying(255) NOT NULL,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    quoc_gia_id integer,
    ten_viet_tat character varying(100)
);


--
-- Name: dm_xa_phuong; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_xa_phuong (
    id integer NOT NULL,
    ma_xa_phuong character varying(30) NOT NULL,
    ten_xa_phuong character varying(255) NOT NULL,
    tinh_thanh_id integer NOT NULL,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    ten_viet_tat character varying(100)
);


--
-- Name: dm_dia_chi; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.dm_dia_chi AS
 SELECT xp.id,
    xp.ma_xa_phuong AS ma_dia_chi,
    concat_ws(', '::text, xp.ten_xa_phuong, tt.ten_tinh_thanh, qg.ten_quoc_gia) AS ten_dia_chi,
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
    ((qg.active = true) AND (tt.active = true) AND (xp.active = true)) AS active
   FROM ((public.dm_xa_phuong xp
     JOIN public.dm_tinh_thanh tt ON ((tt.id = xp.tinh_thanh_id)))
     JOIN public.dm_quoc_gia qg ON ((qg.id = tt.quoc_gia_id)));


--
-- Name: dm_don_vi_tinh; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_don_vi_tinh (
    id integer NOT NULL,
    ma_don_vi_tinh character varying(50) NOT NULL,
    ten_don_vi_tinh character varying(100) NOT NULL,
    ky_hieu character varying(20),
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    loai_don_vi integer
);


--
-- Name: dm_don_vi_tinh_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_don_vi_tinh_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_don_vi_tinh_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_don_vi_tinh_id_seq OWNED BY public.dm_don_vi_tinh.id;


--
-- Name: dm_kho; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_kho (
    id integer NOT NULL,
    ma_kho character varying(50) NOT NULL,
    ten_kho character varying(150) NOT NULL,
    nha_an_id integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    loai_kho smallint,
    dia_diem character varying(255),
    dien_tich numeric(17,5),
    nhiet_do_toi_thieu numeric(14,4),
    nhiet_do_toi_da numeric(14,4),
    mo_ta character varying(500),
    ghi_chu character varying(500),
    CONSTRAINT chk_dm_kho_nhiet_do CHECK (((nhiet_do_toi_thieu IS NULL) OR (nhiet_do_toi_da IS NULL) OR (nhiet_do_toi_da >= nhiet_do_toi_thieu)))
);


--
-- Name: dm_kho_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_kho_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_kho_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_kho_id_seq OWNED BY public.dm_kho.id;


--
-- Name: dm_mon_an; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_mon_an (
    id integer NOT NULL,
    ma_mon_an character varying(50) NOT NULL,
    ten_mon_an character varying(150) NOT NULL,
    nhom_mon_an_id integer NOT NULL,
    gia_tien numeric(18,2),
    calories integer,
    mo_ta character varying(500),
    hinh_anh text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    gia_du_kien numeric(18,2) DEFAULT 0 NOT NULL
);


--
-- Name: dm_mon_an_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_mon_an_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_mon_an_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_mon_an_id_seq OWNED BY public.dm_mon_an.id;


--
-- Name: dm_nha_an; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_nha_an (
    id integer NOT NULL,
    ma_nha_an character varying(50) NOT NULL,
    ten_nha_an character varying(150) NOT NULL,
    co_so_id integer,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: dm_nha_an_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_nha_an_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_nha_an_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_nha_an_id_seq OWNED BY public.dm_nha_an.id;


--
-- Name: dm_nhan_vien; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_nhan_vien (
    id integer NOT NULL,
    ma_nhan_vien character varying(50) NOT NULL,
    ho_ten character varying(150) NOT NULL,
    email character varying(150),
    so_dien_thoai character varying(20),
    anh_dai_dien text,
    chuc_vu_id integer,
    co_so_id integer,
    phong_ban_id integer,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    ngay_sinh timestamp with time zone,
    gioi_tinh smallint,
    dia_chi text,
    ghi_chu text,
    ma_the character varying(100),
    ma_qr character varying(255),
    ma_barcode character varying(255),
    tinh_thanh_id integer,
    xa_phuong_id integer,
    quoc_gia_id integer
);


--
-- Name: dm_nhan_vien_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_nhan_vien_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_nhan_vien_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_nhan_vien_id_seq OWNED BY public.dm_nhan_vien.id;


--
-- Name: dm_nhan_vien_vai_tro; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_nhan_vien_vai_tro (
    id integer NOT NULL,
    nhan_vien_id integer NOT NULL,
    vai_tro_id integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: dm_nhan_vien_vai_tro_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_nhan_vien_vai_tro_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_nhan_vien_vai_tro_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_nhan_vien_vai_tro_id_seq OWNED BY public.dm_nhan_vien_vai_tro.id;


--
-- Name: dm_nhom_mon_an; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_nhom_mon_an (
    id integer NOT NULL,
    ma_nhom_mon_an character varying(50) NOT NULL,
    ten_nhom_mon_an character varying(150) NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    mo_ta character varying(500)
);


--
-- Name: dm_nhom_mon_an_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_nhom_mon_an_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_nhom_mon_an_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_nhom_mon_an_id_seq OWNED BY public.dm_nhom_mon_an.id;


--
-- Name: dm_nhom_tinh_nang; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_nhom_tinh_nang (
    id bigint NOT NULL,
    ma_nhom_tinh_nang character varying(50) NOT NULL,
    ten_nhom_tinh_nang character varying(255) NOT NULL,
    mo_ta character varying(500),
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: dm_nhom_tinh_nang_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_nhom_tinh_nang_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_nhom_tinh_nang_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_nhom_tinh_nang_id_seq OWNED BY public.dm_nhom_tinh_nang.id;


--
-- Name: dm_phong_ban; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_phong_ban (
    id integer NOT NULL,
    ma_phong_ban character varying(50) NOT NULL,
    ten_phong_ban character varying(150) NOT NULL,
    mo_ta character varying(500),
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    co_so_id integer NOT NULL
);


--
-- Name: dm_phong_ban_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_phong_ban_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_phong_ban_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_phong_ban_id_seq OWNED BY public.dm_phong_ban.id;


--
-- Name: dm_quoc_gia_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_quoc_gia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_quoc_gia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_quoc_gia_id_seq OWNED BY public.dm_quoc_gia.id;


--
-- Name: dm_quyen; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_quyen (
    id integer NOT NULL,
    ma_quyen character varying(50) NOT NULL,
    ten_quyen character varying(100) NOT NULL,
    mo_ta character varying(500),
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: dm_quyen_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_quyen_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_quyen_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_quyen_id_seq OWNED BY public.dm_quyen.id;


--
-- Name: dm_quyen_nhom_tinh_nang; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_quyen_nhom_tinh_nang (
    id bigint NOT NULL,
    quyen_id bigint NOT NULL,
    nhom_tinh_nang_id bigint NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: dm_quyen_nhom_tinh_nang_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_quyen_nhom_tinh_nang_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_quyen_nhom_tinh_nang_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_quyen_nhom_tinh_nang_id_seq OWNED BY public.dm_quyen_nhom_tinh_nang.id;


--
-- Name: dm_tai_khoan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_tai_khoan (
    id integer NOT NULL,
    nhan_vien_id integer NOT NULL,
    ten_dang_nhap character varying(100) NOT NULL,
    mat_khau_hash text NOT NULL,
    so_lan_dang_nhap_sai smallint DEFAULT 0 NOT NULL,
    khoa_den timestamp without time zone,
    lan_dang_nhap_cuoi timestamp with time zone,
    doi_mat_khau_lan_cuoi timestamp with time zone,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    doi_mat_khau_lan_dau boolean DEFAULT true NOT NULL,
    bi_khoa boolean DEFAULT false NOT NULL,
    so_lan_dang_nhap integer DEFAULT 0 NOT NULL
);


--
-- Name: dm_tai_khoan_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_tai_khoan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_tai_khoan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_tai_khoan_id_seq OWNED BY public.dm_tai_khoan.id;


--
-- Name: dm_tai_khoan_vai_tro; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_tai_khoan_vai_tro (
    tai_khoan_id integer NOT NULL,
    vai_tro_id integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: dm_thiet_lap; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_thiet_lap (
    id integer NOT NULL,
    ma_thiet_lap character varying(100) NOT NULL,
    ten_thiet_lap character varying(255) NOT NULL,
    gia_tri text,
    mo_ta character varying(500),
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: dm_thiet_lap_co_so; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_thiet_lap_co_so (
    id integer NOT NULL,
    thiet_lap_id integer NOT NULL,
    co_so_id integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: dm_thiet_lap_co_so_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_thiet_lap_co_so_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_thiet_lap_co_so_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_thiet_lap_co_so_id_seq OWNED BY public.dm_thiet_lap_co_so.id;


--
-- Name: dm_thiet_lap_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_thiet_lap_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_thiet_lap_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_thiet_lap_id_seq OWNED BY public.dm_thiet_lap.id;


--
-- Name: dm_thiet_lap_nhom_tinh_nang; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_thiet_lap_nhom_tinh_nang (
    id bigint NOT NULL,
    thiet_lap_id integer NOT NULL,
    nhom_tinh_nang_id bigint NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: dm_thiet_lap_nhom_tinh_nang_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_thiet_lap_nhom_tinh_nang_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_thiet_lap_nhom_tinh_nang_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_thiet_lap_nhom_tinh_nang_id_seq OWNED BY public.dm_thiet_lap_nhom_tinh_nang.id;


--
-- Name: dm_thuc_pham; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_thuc_pham (
    id integer NOT NULL,
    ma_thuc_pham character varying(50) NOT NULL,
    ten_thuc_pham character varying(150) NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    gia_nhap numeric(18,2),
    ghi_chu text,
    don_vi_so_cap_id integer,
    don_vi_su_dung_id integer,
    he_so_quy_doi numeric(12,2) DEFAULT 1,
    ty_le_hao_hut_du_kien numeric(5,2) DEFAULT 0 NOT NULL,
    mo_ta character varying(500),
    hinh_anh character varying(500),
    quy_cach character varying(255),
    xuat_xu_id integer,
    dieu_kien_bao_quan smallint,
    CONSTRAINT chk_thuc_pham_cung_don_vi_he_so_1 CHECK (((don_vi_so_cap_id IS NULL) OR (don_vi_su_dung_id IS NULL) OR (don_vi_so_cap_id <> don_vi_su_dung_id) OR (he_so_quy_doi = (1)::numeric)))
);


--
-- Name: dm_thuc_pham_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_thuc_pham_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_thuc_pham_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_thuc_pham_id_seq OWNED BY public.dm_thuc_pham.id;


--
-- Name: dm_tinh_thanh_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_tinh_thanh_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_tinh_thanh_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_tinh_thanh_id_seq OWNED BY public.dm_tinh_thanh.id;


--
-- Name: dm_vai_tro; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_vai_tro (
    id integer NOT NULL,
    ma_vai_tro character varying(50) NOT NULL,
    ten_vai_tro character varying(100) NOT NULL,
    mo_ta character varying(500),
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: dm_vai_tro_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_vai_tro_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_vai_tro_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_vai_tro_id_seq OWNED BY public.dm_vai_tro.id;


--
-- Name: dm_vai_tro_quyen; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_vai_tro_quyen (
    vai_tro_id integer NOT NULL,
    quyen_id integer NOT NULL,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: dm_voucher; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_voucher (
    id integer NOT NULL,
    ma_voucher character varying(50) NOT NULL,
    ten_voucher character varying(255) NOT NULL,
    mo_ta character varying(500),
    loai_mien_giam integer CONSTRAINT dm_voucher_loai_giam_not_null NOT NULL,
    gia_tri numeric(18,2) NOT NULL,
    so_luong integer DEFAULT 0 NOT NULL,
    da_su_dung integer DEFAULT 0 NOT NULL,
    thoi_gian_bat_dau timestamp without time zone,
    thoi_gian_ket_thuc timestamp without time zone,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_voucher_loai CHECK ((loai_mien_giam = ANY (ARRAY[10, 20])))
);


--
-- Name: dm_voucher_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_voucher_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_voucher_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_voucher_id_seq OWNED BY public.dm_voucher.id;


--
-- Name: dm_xa_phuong_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_xa_phuong_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_xa_phuong_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_xa_phuong_id_seq OWNED BY public.dm_xa_phuong.id;


--
-- Name: nv_binh_chon_suat_an; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nv_binh_chon_suat_an (
    id integer NOT NULL,
    dot_binh_chon_id integer NOT NULL,
    nhan_vien_id integer NOT NULL,
    co_an boolean NOT NULL,
    thoi_gian_binh_chon timestamp without time zone DEFAULT now() NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    ghi_chu text
);


--
-- Name: nv_binh_chon_suat_an_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nv_binh_chon_suat_an_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: nv_binh_chon_suat_an_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nv_binh_chon_suat_an_id_seq OWNED BY public.nv_binh_chon_suat_an.id;


--
-- Name: nv_dot_binh_chon; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nv_dot_binh_chon (
    id integer NOT NULL,
    ma_dot_binh_chon character varying(50) NOT NULL,
    ten_dot_binh_chon character varying(255) NOT NULL,
    nha_an_id integer NOT NULL,
    ca_an_id integer NOT NULL,
    thoi_gian_bat_dau timestamp without time zone NOT NULL,
    thoi_gian_ket_thuc timestamp without time zone NOT NULL,
    thoi_gian_khoa_binh_chon timestamp without time zone NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    trang_thai smallint DEFAULT 0
);


--
-- Name: nv_dot_binh_chon_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nv_dot_binh_chon_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: nv_dot_binh_chon_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nv_dot_binh_chon_id_seq OWNED BY public.nv_dot_binh_chon.id;


--
-- Name: nv_phieu_nhap; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nv_phieu_nhap (
    id integer NOT NULL,
    ma_phieu_nhap character varying(50) NOT NULL,
    kho_id integer NOT NULL,
    nhan_vien_id integer NOT NULL,
    ngay_nhap timestamp without time zone NOT NULL,
    tong_so_mat_hang integer DEFAULT 0 NOT NULL,
    tong_so_luong numeric(18,3) DEFAULT 0 NOT NULL,
    tong_tien numeric(18,2) DEFAULT 0 NOT NULL,
    nguoi_giao character varying(255),
    nguoi_nhan character varying(255),
    hinh_thuc_nhap character varying(30) NOT NULL,
    ghi_chu text,
    trang_thai character varying(30) DEFAULT 'MOI'::character varying NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: nv_phieu_nhap_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nv_phieu_nhap_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: nv_phieu_nhap_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nv_phieu_nhap_id_seq OWNED BY public.nv_phieu_nhap.id;


--
-- Name: nv_phieu_xuat; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nv_phieu_xuat (
    id integer NOT NULL,
    ma_phieu_xuat character varying(50) NOT NULL,
    kho_id integer NOT NULL,
    nhan_vien_id integer NOT NULL,
    ngay_xuat timestamp without time zone NOT NULL,
    tong_so_mat_hang integer DEFAULT 0 NOT NULL,
    tong_so_luong numeric(18,3) DEFAULT 0 NOT NULL,
    ly_do_xuat character varying(100),
    nguoi_nhan character varying(255),
    ghi_chu text,
    trang_thai character varying(30) DEFAULT 'MOI'::character varying NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: nv_phieu_xuat_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nv_phieu_xuat_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: nv_phieu_xuat_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nv_phieu_xuat_id_seq OWNED BY public.nv_phieu_xuat.id;


--
-- Name: nv_refresh_token; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nv_refresh_token (
    id integer NOT NULL,
    token text NOT NULL,
    tai_khoan_id integer NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    revoked boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: nv_refresh_token_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nv_refresh_token_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: nv_refresh_token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nv_refresh_token_id_seq OWNED BY public.nv_refresh_token.id;


--
-- Name: nv_thuc_don; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nv_thuc_don (
    id bigint NOT NULL,
    ma_thuc_don character varying(50) NOT NULL,
    ten_thuc_don character varying(255) NOT NULL,
    loai_thuc_don integer NOT NULL,
    tu_ngay timestamp without time zone NOT NULL,
    den_ngay timestamp without time zone NOT NULL,
    co_so_id bigint NOT NULL,
    nha_an_id bigint NOT NULL,
    ca_an_id bigint,
    trang_thai integer DEFAULT 10 NOT NULL,
    mo_ta character varying(500),
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    trang_thai_truoc_huy integer,
    trang_thai_truoc_ket_thuc integer,
    CONSTRAINT chk_nv_thuc_don_loai CHECK ((loai_thuc_don = ANY (ARRAY[10, 20, 30, 40]))),
    CONSTRAINT chk_nv_thuc_don_ngay CHECK ((tu_ngay <= den_ngay)),
    CONSTRAINT chk_nv_thuc_don_trang_thai CHECK ((trang_thai = ANY (ARRAY[10, 20, 30, 40, 50, 60]))),
    CONSTRAINT chk_nv_thuc_don_trang_thai_truoc_huy CHECK (((trang_thai_truoc_huy IS NULL) OR (trang_thai_truoc_huy = ANY (ARRAY[10, 20, 30, 40])))),
    CONSTRAINT chk_nv_thuc_don_trang_thai_truoc_ket_thuc CHECK (((trang_thai_truoc_ket_thuc IS NULL) OR (trang_thai_truoc_ket_thuc = ANY (ARRAY[10, 20, 30, 40]))))
);


--
-- Name: nv_thuc_don_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nv_thuc_don_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: nv_thuc_don_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nv_thuc_don_id_seq OWNED BY public.nv_thuc_don.id;


--
-- Name: ton_kho; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ton_kho (
    id integer NOT NULL,
    kho_id integer NOT NULL,
    thuc_pham_id integer NOT NULL,
    so_luong_ton_so_cap numeric(18,3) DEFAULT 0 NOT NULL,
    so_luong_ton_su_dung numeric(18,3) DEFAULT 0 NOT NULL,
    gia_von_trung_binh numeric(18,2) DEFAULT 0 NOT NULL,
    gia_tri_ton numeric(18,2) DEFAULT 0 NOT NULL,
    ngay_cap_nhat timestamp without time zone DEFAULT now() NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    last_phieu_nhap_id integer,
    last_phieu_xuat_id integer
);


--
-- Name: ton_kho_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ton_kho_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ton_kho_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ton_kho_id_seq OWNED BY public.ton_kho.id;


--
-- Name: ct_chinh_sach_chuc_vu id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_chinh_sach_chuc_vu ALTER COLUMN id SET DEFAULT nextval('public.ct_chinh_sach_chuc_vu_id_seq'::regclass);


--
-- Name: ct_chinh_sach_tai_khoan id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_chinh_sach_tai_khoan ALTER COLUMN id SET DEFAULT nextval('public.ct_chinh_sach_tai_khoan_id_seq'::regclass);


--
-- Name: ct_chinh_sach_vai_tro id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_chinh_sach_vai_tro ALTER COLUMN id SET DEFAULT nextval('public.ct_chinh_sach_vai_tro_id_seq'::regclass);


--
-- Name: ct_kho_nhan_vien_quan_ly id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_kho_nhan_vien_quan_ly ALTER COLUMN id SET DEFAULT nextval('public.ct_kho_nhan_vien_quan_ly_id_seq'::regclass);


--
-- Name: ct_mon_an_thuc_pham id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_mon_an_thuc_pham ALTER COLUMN id SET DEFAULT nextval('public.ct_mon_an_thuc_pham_id_seq'::regclass);


--
-- Name: ct_nha_an_nhan_vien id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_nha_an_nhan_vien ALTER COLUMN id SET DEFAULT nextval('public.ct_nha_an_nhan_vien_id_seq'::regclass);


--
-- Name: ct_phieu_nhap id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_phieu_nhap ALTER COLUMN id SET DEFAULT nextval('public.ct_phieu_nhap_id_seq'::regclass);


--
-- Name: ct_phieu_xuat id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_phieu_xuat ALTER COLUMN id SET DEFAULT nextval('public.ct_phieu_xuat_id_seq'::regclass);


--
-- Name: ct_thuc_don_mon_an id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_thuc_don_mon_an ALTER COLUMN id SET DEFAULT nextval('public.ct_thuc_don_mon_an_id_seq'::regclass);


--
-- Name: ct_thuc_don_ngay id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_thuc_don_ngay ALTER COLUMN id SET DEFAULT nextval('public.ct_thuc_don_ngay_id_seq'::regclass);


--
-- Name: ct_thuc_don_nhom_mon_an id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_thuc_don_nhom_mon_an ALTER COLUMN id SET DEFAULT nextval('public.ct_thuc_don_nhom_mon_an_id_seq'::regclass);


--
-- Name: dm_bao_cao id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_bao_cao ALTER COLUMN id SET DEFAULT nextval('public.dm_bao_cao_id_seq'::regclass);


--
-- Name: dm_ca_an id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_ca_an ALTER COLUMN id SET DEFAULT nextval('public.dm_ca_an_id_seq'::regclass);


--
-- Name: dm_chinh_sach id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_chinh_sach ALTER COLUMN id SET DEFAULT nextval('public.dm_chinh_sach_id_seq'::regclass);


--
-- Name: dm_chuc_vu id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_chuc_vu ALTER COLUMN id SET DEFAULT nextval('public.dm_chuc_vu_id_seq'::regclass);


--
-- Name: dm_co_so id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_co_so ALTER COLUMN id SET DEFAULT nextval('public.dm_co_so_id_seq'::regclass);


--
-- Name: dm_don_vi_tinh id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_don_vi_tinh ALTER COLUMN id SET DEFAULT nextval('public.dm_don_vi_tinh_id_seq'::regclass);


--
-- Name: dm_kho id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_kho ALTER COLUMN id SET DEFAULT nextval('public.dm_kho_id_seq'::regclass);


--
-- Name: dm_mon_an id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_mon_an ALTER COLUMN id SET DEFAULT nextval('public.dm_mon_an_id_seq'::regclass);


--
-- Name: dm_nha_an id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nha_an ALTER COLUMN id SET DEFAULT nextval('public.dm_nha_an_id_seq'::regclass);


--
-- Name: dm_nhan_vien id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhan_vien ALTER COLUMN id SET DEFAULT nextval('public.dm_nhan_vien_id_seq'::regclass);


--
-- Name: dm_nhan_vien_vai_tro id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhan_vien_vai_tro ALTER COLUMN id SET DEFAULT nextval('public.dm_nhan_vien_vai_tro_id_seq'::regclass);


--
-- Name: dm_nhom_mon_an id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhom_mon_an ALTER COLUMN id SET DEFAULT nextval('public.dm_nhom_mon_an_id_seq'::regclass);


--
-- Name: dm_nhom_tinh_nang id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhom_tinh_nang ALTER COLUMN id SET DEFAULT nextval('public.dm_nhom_tinh_nang_id_seq'::regclass);


--
-- Name: dm_phong_ban id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_phong_ban ALTER COLUMN id SET DEFAULT nextval('public.dm_phong_ban_id_seq'::regclass);


--
-- Name: dm_quoc_gia id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_quoc_gia ALTER COLUMN id SET DEFAULT nextval('public.dm_quoc_gia_id_seq'::regclass);


--
-- Name: dm_quyen id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_quyen ALTER COLUMN id SET DEFAULT nextval('public.dm_quyen_id_seq'::regclass);


--
-- Name: dm_quyen_nhom_tinh_nang id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_quyen_nhom_tinh_nang ALTER COLUMN id SET DEFAULT nextval('public.dm_quyen_nhom_tinh_nang_id_seq'::regclass);


--
-- Name: dm_tai_khoan id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_tai_khoan ALTER COLUMN id SET DEFAULT nextval('public.dm_tai_khoan_id_seq'::regclass);


--
-- Name: dm_thiet_lap id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_thiet_lap ALTER COLUMN id SET DEFAULT nextval('public.dm_thiet_lap_id_seq'::regclass);


--
-- Name: dm_thiet_lap_co_so id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_thiet_lap_co_so ALTER COLUMN id SET DEFAULT nextval('public.dm_thiet_lap_co_so_id_seq'::regclass);


--
-- Name: dm_thiet_lap_nhom_tinh_nang id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_thiet_lap_nhom_tinh_nang ALTER COLUMN id SET DEFAULT nextval('public.dm_thiet_lap_nhom_tinh_nang_id_seq'::regclass);


--
-- Name: dm_thuc_pham id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_thuc_pham ALTER COLUMN id SET DEFAULT nextval('public.dm_thuc_pham_id_seq'::regclass);


--
-- Name: dm_tinh_thanh id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_tinh_thanh ALTER COLUMN id SET DEFAULT nextval('public.dm_tinh_thanh_id_seq'::regclass);


--
-- Name: dm_vai_tro id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_vai_tro ALTER COLUMN id SET DEFAULT nextval('public.dm_vai_tro_id_seq'::regclass);


--
-- Name: dm_voucher id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_voucher ALTER COLUMN id SET DEFAULT nextval('public.dm_voucher_id_seq'::regclass);


--
-- Name: dm_xa_phuong id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_xa_phuong ALTER COLUMN id SET DEFAULT nextval('public.dm_xa_phuong_id_seq'::regclass);


--
-- Name: nv_binh_chon_suat_an id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_binh_chon_suat_an ALTER COLUMN id SET DEFAULT nextval('public.nv_binh_chon_suat_an_id_seq'::regclass);


--
-- Name: nv_dot_binh_chon id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_dot_binh_chon ALTER COLUMN id SET DEFAULT nextval('public.nv_dot_binh_chon_id_seq'::regclass);


--
-- Name: nv_phieu_nhap id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_phieu_nhap ALTER COLUMN id SET DEFAULT nextval('public.nv_phieu_nhap_id_seq'::regclass);


--
-- Name: nv_phieu_xuat id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_phieu_xuat ALTER COLUMN id SET DEFAULT nextval('public.nv_phieu_xuat_id_seq'::regclass);


--
-- Name: nv_refresh_token id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_refresh_token ALTER COLUMN id SET DEFAULT nextval('public.nv_refresh_token_id_seq'::regclass);


--
-- Name: nv_thuc_don id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thuc_don ALTER COLUMN id SET DEFAULT nextval('public.nv_thuc_don_id_seq'::regclass);


--
-- Name: ton_kho id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ton_kho ALTER COLUMN id SET DEFAULT nextval('public.ton_kho_id_seq'::regclass);


--
-- Name: ct_binh_chon_suat_an ct_binh_chon_suat_an_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_binh_chon_suat_an
    ADD CONSTRAINT ct_binh_chon_suat_an_pkey PRIMARY KEY (binh_chon_id, mon_an_id);


--
-- Name: ct_chinh_sach_chuc_vu ct_chinh_sach_chuc_vu_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_chinh_sach_chuc_vu
    ADD CONSTRAINT ct_chinh_sach_chuc_vu_pkey PRIMARY KEY (id);


--
-- Name: ct_chinh_sach_tai_khoan ct_chinh_sach_tai_khoan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_chinh_sach_tai_khoan
    ADD CONSTRAINT ct_chinh_sach_tai_khoan_pkey PRIMARY KEY (id);


--
-- Name: ct_chinh_sach_vai_tro ct_chinh_sach_vai_tro_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_chinh_sach_vai_tro
    ADD CONSTRAINT ct_chinh_sach_vai_tro_pkey PRIMARY KEY (id);


--
-- Name: ct_dot_binh_chon_chinh_sach ct_dot_binh_chon_chinh_sach_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_dot_binh_chon_chinh_sach
    ADD CONSTRAINT ct_dot_binh_chon_chinh_sach_pkey PRIMARY KEY (dot_binh_chon_id, chinh_sach_id);


--
-- Name: ct_dot_binh_chon_chuc_vu ct_dot_binh_chon_chuc_vu_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_dot_binh_chon_chuc_vu
    ADD CONSTRAINT ct_dot_binh_chon_chuc_vu_pkey PRIMARY KEY (dot_binh_chon_id, chuc_vu_id);


--
-- Name: ct_dot_binh_chon_mon_an ct_dot_binh_chon_mon_an_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_dot_binh_chon_mon_an
    ADD CONSTRAINT ct_dot_binh_chon_mon_an_pkey PRIMARY KEY (dot_binh_chon_id, mon_an_id);


--
-- Name: ct_dot_binh_chon_nhom_mon ct_dot_binh_chon_nhom_mon_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_dot_binh_chon_nhom_mon
    ADD CONSTRAINT ct_dot_binh_chon_nhom_mon_pkey PRIMARY KEY (dot_binh_chon_id, nhom_mon_an_id);


--
-- Name: ct_kho_nhan_vien_quan_ly ct_kho_nhan_vien_quan_ly_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_kho_nhan_vien_quan_ly
    ADD CONSTRAINT ct_kho_nhan_vien_quan_ly_pkey PRIMARY KEY (id);


--
-- Name: ct_mon_an_thuc_pham ct_mon_an_thuc_pham_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_mon_an_thuc_pham
    ADD CONSTRAINT ct_mon_an_thuc_pham_pkey PRIMARY KEY (id);


--
-- Name: ct_nha_an_nhan_vien ct_nha_an_nhan_vien_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_nha_an_nhan_vien
    ADD CONSTRAINT ct_nha_an_nhan_vien_pkey PRIMARY KEY (id);


--
-- Name: ct_phieu_nhap ct_phieu_nhap_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_phieu_nhap
    ADD CONSTRAINT ct_phieu_nhap_pkey PRIMARY KEY (id);


--
-- Name: ct_phieu_xuat ct_phieu_xuat_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_phieu_xuat
    ADD CONSTRAINT ct_phieu_xuat_pkey PRIMARY KEY (id);


--
-- Name: ct_thuc_don_mon_an ct_thuc_don_mon_an_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_thuc_don_mon_an
    ADD CONSTRAINT ct_thuc_don_mon_an_pkey PRIMARY KEY (id);


--
-- Name: ct_thuc_don_ngay ct_thuc_don_ngay_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_thuc_don_ngay
    ADD CONSTRAINT ct_thuc_don_ngay_pkey PRIMARY KEY (id);


--
-- Name: ct_thuc_don_nhom_mon_an ct_thuc_don_nhom_mon_an_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_thuc_don_nhom_mon_an
    ADD CONSTRAINT ct_thuc_don_nhom_mon_an_pkey PRIMARY KEY (id);


--
-- Name: dm_bao_cao dm_bao_cao_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_bao_cao
    ADD CONSTRAINT dm_bao_cao_pkey PRIMARY KEY (id);


--
-- Name: dm_ca_an dm_ca_an_ma_ca_an_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_ca_an
    ADD CONSTRAINT dm_ca_an_ma_ca_an_key UNIQUE (ma_ca_an);


--
-- Name: dm_ca_an dm_ca_an_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_ca_an
    ADD CONSTRAINT dm_ca_an_pkey PRIMARY KEY (id);


--
-- Name: dm_chinh_sach dm_chinh_sach_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_chinh_sach
    ADD CONSTRAINT dm_chinh_sach_pkey PRIMARY KEY (id);


--
-- Name: dm_chuc_vu dm_chuc_vu_ma_chuc_vu_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_chuc_vu
    ADD CONSTRAINT dm_chuc_vu_ma_chuc_vu_key UNIQUE (ma_chuc_vu);


--
-- Name: dm_chuc_vu dm_chuc_vu_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_chuc_vu
    ADD CONSTRAINT dm_chuc_vu_pkey PRIMARY KEY (id);


--
-- Name: dm_co_so dm_co_so_ma_co_so_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_co_so
    ADD CONSTRAINT dm_co_so_ma_co_so_key UNIQUE (ma_co_so);


--
-- Name: dm_co_so dm_co_so_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_co_so
    ADD CONSTRAINT dm_co_so_pkey PRIMARY KEY (id);


--
-- Name: dm_don_vi_tinh dm_don_vi_tinh_ma_don_vi_tinh_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_don_vi_tinh
    ADD CONSTRAINT dm_don_vi_tinh_ma_don_vi_tinh_key UNIQUE (ma_don_vi_tinh);


--
-- Name: dm_don_vi_tinh dm_don_vi_tinh_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_don_vi_tinh
    ADD CONSTRAINT dm_don_vi_tinh_pkey PRIMARY KEY (id);


--
-- Name: dm_kho dm_kho_ma_kho_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_kho
    ADD CONSTRAINT dm_kho_ma_kho_key UNIQUE (ma_kho);


--
-- Name: dm_kho dm_kho_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_kho
    ADD CONSTRAINT dm_kho_pkey PRIMARY KEY (id);


--
-- Name: dm_mon_an dm_mon_an_ma_mon_an_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_mon_an
    ADD CONSTRAINT dm_mon_an_ma_mon_an_key UNIQUE (ma_mon_an);


--
-- Name: dm_mon_an dm_mon_an_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_mon_an
    ADD CONSTRAINT dm_mon_an_pkey PRIMARY KEY (id);


--
-- Name: dm_nha_an dm_nha_an_ma_nha_an_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nha_an
    ADD CONSTRAINT dm_nha_an_ma_nha_an_key UNIQUE (ma_nha_an);


--
-- Name: dm_nha_an dm_nha_an_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nha_an
    ADD CONSTRAINT dm_nha_an_pkey PRIMARY KEY (id);


--
-- Name: dm_nhan_vien dm_nhan_vien_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhan_vien
    ADD CONSTRAINT dm_nhan_vien_email_key UNIQUE (email);


--
-- Name: dm_nhan_vien dm_nhan_vien_ma_nhan_vien_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhan_vien
    ADD CONSTRAINT dm_nhan_vien_ma_nhan_vien_key UNIQUE (ma_nhan_vien);


--
-- Name: dm_nhan_vien dm_nhan_vien_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhan_vien
    ADD CONSTRAINT dm_nhan_vien_pkey PRIMARY KEY (id);


--
-- Name: dm_nhan_vien_vai_tro dm_nhan_vien_vai_tro_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhan_vien_vai_tro
    ADD CONSTRAINT dm_nhan_vien_vai_tro_pkey PRIMARY KEY (id);


--
-- Name: dm_nhom_mon_an dm_nhom_mon_an_ma_nhom_mon_an_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhom_mon_an
    ADD CONSTRAINT dm_nhom_mon_an_ma_nhom_mon_an_key UNIQUE (ma_nhom_mon_an);


--
-- Name: dm_nhom_mon_an dm_nhom_mon_an_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhom_mon_an
    ADD CONSTRAINT dm_nhom_mon_an_pkey PRIMARY KEY (id);


--
-- Name: dm_nhom_tinh_nang dm_nhom_tinh_nang_ma_nhom_tinh_nang_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhom_tinh_nang
    ADD CONSTRAINT dm_nhom_tinh_nang_ma_nhom_tinh_nang_key UNIQUE (ma_nhom_tinh_nang);


--
-- Name: dm_nhom_tinh_nang dm_nhom_tinh_nang_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhom_tinh_nang
    ADD CONSTRAINT dm_nhom_tinh_nang_pkey PRIMARY KEY (id);


--
-- Name: dm_phong_ban dm_phong_ban_ma_phong_ban_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_phong_ban
    ADD CONSTRAINT dm_phong_ban_ma_phong_ban_key UNIQUE (ma_phong_ban);


--
-- Name: dm_phong_ban dm_phong_ban_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_phong_ban
    ADD CONSTRAINT dm_phong_ban_pkey PRIMARY KEY (id);


--
-- Name: dm_quoc_gia dm_quoc_gia_ma_quoc_gia_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_quoc_gia
    ADD CONSTRAINT dm_quoc_gia_ma_quoc_gia_key UNIQUE (ma_quoc_gia);


--
-- Name: dm_quoc_gia dm_quoc_gia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_quoc_gia
    ADD CONSTRAINT dm_quoc_gia_pkey PRIMARY KEY (id);


--
-- Name: dm_quyen dm_quyen_ma_quyen_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_quyen
    ADD CONSTRAINT dm_quyen_ma_quyen_key UNIQUE (ma_quyen);


--
-- Name: dm_quyen_nhom_tinh_nang dm_quyen_nhom_tinh_nang_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_quyen_nhom_tinh_nang
    ADD CONSTRAINT dm_quyen_nhom_tinh_nang_pkey PRIMARY KEY (id);


--
-- Name: dm_quyen dm_quyen_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_quyen
    ADD CONSTRAINT dm_quyen_pkey PRIMARY KEY (id);


--
-- Name: dm_tai_khoan dm_tai_khoan_nhan_vien_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_tai_khoan
    ADD CONSTRAINT dm_tai_khoan_nhan_vien_id_key UNIQUE (nhan_vien_id);


--
-- Name: dm_tai_khoan dm_tai_khoan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_tai_khoan
    ADD CONSTRAINT dm_tai_khoan_pkey PRIMARY KEY (id);


--
-- Name: dm_tai_khoan dm_tai_khoan_ten_dang_nhap_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_tai_khoan
    ADD CONSTRAINT dm_tai_khoan_ten_dang_nhap_key UNIQUE (ten_dang_nhap);


--
-- Name: dm_tai_khoan_vai_tro dm_tai_khoan_vai_tro_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_tai_khoan_vai_tro
    ADD CONSTRAINT dm_tai_khoan_vai_tro_pkey PRIMARY KEY (tai_khoan_id, vai_tro_id);


--
-- Name: dm_thiet_lap_co_so dm_thiet_lap_co_so_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_thiet_lap_co_so
    ADD CONSTRAINT dm_thiet_lap_co_so_pkey PRIMARY KEY (id);


--
-- Name: dm_thiet_lap dm_thiet_lap_ma_thiet_lap_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_thiet_lap
    ADD CONSTRAINT dm_thiet_lap_ma_thiet_lap_key UNIQUE (ma_thiet_lap);


--
-- Name: dm_thiet_lap_nhom_tinh_nang dm_thiet_lap_nhom_tinh_nang_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_thiet_lap_nhom_tinh_nang
    ADD CONSTRAINT dm_thiet_lap_nhom_tinh_nang_pkey PRIMARY KEY (id);


--
-- Name: dm_thiet_lap dm_thiet_lap_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_thiet_lap
    ADD CONSTRAINT dm_thiet_lap_pkey PRIMARY KEY (id);


--
-- Name: dm_thuc_pham dm_thuc_pham_ma_thuc_pham_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_thuc_pham
    ADD CONSTRAINT dm_thuc_pham_ma_thuc_pham_key UNIQUE (ma_thuc_pham);


--
-- Name: dm_thuc_pham dm_thuc_pham_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_thuc_pham
    ADD CONSTRAINT dm_thuc_pham_pkey PRIMARY KEY (id);


--
-- Name: dm_tinh_thanh dm_tinh_thanh_ma_tinh_thanh_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_tinh_thanh
    ADD CONSTRAINT dm_tinh_thanh_ma_tinh_thanh_key UNIQUE (ma_tinh_thanh);


--
-- Name: dm_tinh_thanh dm_tinh_thanh_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_tinh_thanh
    ADD CONSTRAINT dm_tinh_thanh_pkey PRIMARY KEY (id);


--
-- Name: dm_vai_tro dm_vai_tro_ma_vai_tro_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_vai_tro
    ADD CONSTRAINT dm_vai_tro_ma_vai_tro_key UNIQUE (ma_vai_tro);


--
-- Name: dm_vai_tro dm_vai_tro_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_vai_tro
    ADD CONSTRAINT dm_vai_tro_pkey PRIMARY KEY (id);


--
-- Name: dm_vai_tro_quyen dm_vai_tro_quyen_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_vai_tro_quyen
    ADD CONSTRAINT dm_vai_tro_quyen_pkey PRIMARY KEY (vai_tro_id, quyen_id);


--
-- Name: dm_voucher dm_voucher_ma_voucher_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_voucher
    ADD CONSTRAINT dm_voucher_ma_voucher_key UNIQUE (ma_voucher);


--
-- Name: dm_voucher dm_voucher_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_voucher
    ADD CONSTRAINT dm_voucher_pkey PRIMARY KEY (id);


--
-- Name: dm_xa_phuong dm_xa_phuong_ma_xa_phuong_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_xa_phuong
    ADD CONSTRAINT dm_xa_phuong_ma_xa_phuong_key UNIQUE (ma_xa_phuong);


--
-- Name: dm_xa_phuong dm_xa_phuong_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_xa_phuong
    ADD CONSTRAINT dm_xa_phuong_pkey PRIMARY KEY (id);


--
-- Name: nv_binh_chon_suat_an nv_binh_chon_suat_an_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_binh_chon_suat_an
    ADD CONSTRAINT nv_binh_chon_suat_an_pkey PRIMARY KEY (id);


--
-- Name: nv_dot_binh_chon nv_dot_binh_chon_ma_dot_binh_chon_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_dot_binh_chon
    ADD CONSTRAINT nv_dot_binh_chon_ma_dot_binh_chon_key UNIQUE (ma_dot_binh_chon);


--
-- Name: nv_dot_binh_chon nv_dot_binh_chon_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_dot_binh_chon
    ADD CONSTRAINT nv_dot_binh_chon_pkey PRIMARY KEY (id);


--
-- Name: nv_phieu_nhap nv_phieu_nhap_ma_phieu_nhap_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_phieu_nhap
    ADD CONSTRAINT nv_phieu_nhap_ma_phieu_nhap_key UNIQUE (ma_phieu_nhap);


--
-- Name: nv_phieu_nhap nv_phieu_nhap_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_phieu_nhap
    ADD CONSTRAINT nv_phieu_nhap_pkey PRIMARY KEY (id);


--
-- Name: nv_phieu_xuat nv_phieu_xuat_ma_phieu_xuat_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_phieu_xuat
    ADD CONSTRAINT nv_phieu_xuat_ma_phieu_xuat_key UNIQUE (ma_phieu_xuat);


--
-- Name: nv_phieu_xuat nv_phieu_xuat_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_phieu_xuat
    ADD CONSTRAINT nv_phieu_xuat_pkey PRIMARY KEY (id);


--
-- Name: nv_refresh_token nv_refresh_token_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_refresh_token
    ADD CONSTRAINT nv_refresh_token_pkey PRIMARY KEY (id);


--
-- Name: nv_refresh_token nv_refresh_token_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_refresh_token
    ADD CONSTRAINT nv_refresh_token_token_key UNIQUE (token);


--
-- Name: nv_thuc_don nv_thuc_don_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thuc_don
    ADD CONSTRAINT nv_thuc_don_pkey PRIMARY KEY (id);


--
-- Name: ct_chinh_sach_voucher pk_ct_chinh_sach_voucher; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_chinh_sach_voucher
    ADD CONSTRAINT pk_ct_chinh_sach_voucher PRIMARY KEY (chinh_sach_id, voucher_id);


--
-- Name: ton_kho ton_kho_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ton_kho
    ADD CONSTRAINT ton_kho_pkey PRIMARY KEY (id);


--
-- Name: ct_chinh_sach_chuc_vu uq_ct_chinh_sach_chuc_vu; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_chinh_sach_chuc_vu
    ADD CONSTRAINT uq_ct_chinh_sach_chuc_vu UNIQUE (chinh_sach_id, chuc_vu_id);


--
-- Name: ct_chinh_sach_tai_khoan uq_ct_chinh_sach_tai_khoan; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_chinh_sach_tai_khoan
    ADD CONSTRAINT uq_ct_chinh_sach_tai_khoan UNIQUE (chinh_sach_id, tai_khoan_id);


--
-- Name: ct_chinh_sach_vai_tro uq_ct_chinh_sach_vai_tro; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_chinh_sach_vai_tro
    ADD CONSTRAINT uq_ct_chinh_sach_vai_tro UNIQUE (chinh_sach_id, vai_tro_id);


--
-- Name: ct_dot_binh_chon_chinh_sach uq_ct_dot_binh_chon_chinh_sach; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_dot_binh_chon_chinh_sach
    ADD CONSTRAINT uq_ct_dot_binh_chon_chinh_sach UNIQUE (dot_binh_chon_id, chinh_sach_id);


--
-- Name: ct_kho_nhan_vien_quan_ly uq_ct_kho_nhan_vien_quan_ly; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_kho_nhan_vien_quan_ly
    ADD CONSTRAINT uq_ct_kho_nhan_vien_quan_ly UNIQUE (kho_id, nhan_vien_id);


--
-- Name: ct_mon_an_thuc_pham uq_ct_mon_an_thuc_pham; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_mon_an_thuc_pham
    ADD CONSTRAINT uq_ct_mon_an_thuc_pham UNIQUE (mon_an_id, thuc_pham_id);


--
-- Name: ct_nha_an_nhan_vien uq_ct_nha_an_nhan_vien; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_nha_an_nhan_vien
    ADD CONSTRAINT uq_ct_nha_an_nhan_vien UNIQUE (nha_an_id, nhan_vien_id);


--
-- Name: ct_thuc_don_mon_an uq_ct_thuc_don_mon_an; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_thuc_don_mon_an
    ADD CONSTRAINT uq_ct_thuc_don_mon_an UNIQUE (thuc_don_nhom_mon_an_id, mon_an_id);


--
-- Name: ct_thuc_don_ngay uq_ct_thuc_don_ngay; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_thuc_don_ngay
    ADD CONSTRAINT uq_ct_thuc_don_ngay UNIQUE (thuc_don_id, ngay);


--
-- Name: ct_thuc_don_nhom_mon_an uq_ct_thuc_don_nhom_mon_an; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_thuc_don_nhom_mon_an
    ADD CONSTRAINT uq_ct_thuc_don_nhom_mon_an UNIQUE (thuc_don_ngay_id, nhom_mon_an_id);


--
-- Name: dm_bao_cao uq_dm_bao_cao_ma; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_bao_cao
    ADD CONSTRAINT uq_dm_bao_cao_ma UNIQUE (ma_bao_cao);


--
-- Name: dm_chinh_sach uq_dm_chinh_sach_ma; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_chinh_sach
    ADD CONSTRAINT uq_dm_chinh_sach_ma UNIQUE (ma_chinh_sach);


--
-- Name: dm_nhan_vien uq_dm_nhan_vien_ma_barcode; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhan_vien
    ADD CONSTRAINT uq_dm_nhan_vien_ma_barcode UNIQUE (ma_barcode);


--
-- Name: dm_nhan_vien uq_dm_nhan_vien_ma_qr; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhan_vien
    ADD CONSTRAINT uq_dm_nhan_vien_ma_qr UNIQUE (ma_qr);


--
-- Name: dm_nhan_vien uq_dm_nhan_vien_ma_the; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhan_vien
    ADD CONSTRAINT uq_dm_nhan_vien_ma_the UNIQUE (ma_the);


--
-- Name: nv_binh_chon_suat_an uq_dot_nhan_vien; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_binh_chon_suat_an
    ADD CONSTRAINT uq_dot_nhan_vien UNIQUE (dot_binh_chon_id, nhan_vien_id);


--
-- Name: nv_thuc_don uq_nv_thuc_don_ma; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thuc_don
    ADD CONSTRAINT uq_nv_thuc_don_ma UNIQUE (ma_thuc_don);


--
-- Name: dm_nhan_vien_vai_tro uq_nv_vai_tro; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhan_vien_vai_tro
    ADD CONSTRAINT uq_nv_vai_tro UNIQUE (nhan_vien_id, vai_tro_id);


--
-- Name: dm_quyen_nhom_tinh_nang uq_quyen_nhom_tinh_nang; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_quyen_nhom_tinh_nang
    ADD CONSTRAINT uq_quyen_nhom_tinh_nang UNIQUE (quyen_id, nhom_tinh_nang_id);


--
-- Name: dm_thiet_lap_co_so uq_thiet_lap_co_so; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_thiet_lap_co_so
    ADD CONSTRAINT uq_thiet_lap_co_so UNIQUE (thiet_lap_id, co_so_id);


--
-- Name: dm_thiet_lap_nhom_tinh_nang uq_thiet_lap_nhom_tinh_nang; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_thiet_lap_nhom_tinh_nang
    ADD CONSTRAINT uq_thiet_lap_nhom_tinh_nang UNIQUE (thiet_lap_id, nhom_tinh_nang_id);


--
-- Name: ton_kho uq_ton_kho; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ton_kho
    ADD CONSTRAINT uq_ton_kho UNIQUE (kho_id, thuc_pham_id);


--
-- Name: idx_ct_cscv_chuc_vu; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_cscv_chuc_vu ON public.ct_chinh_sach_chuc_vu USING btree (chuc_vu_id);


--
-- Name: idx_ct_cstk_tai_khoan; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_cstk_tai_khoan ON public.ct_chinh_sach_tai_khoan USING btree (tai_khoan_id);


--
-- Name: idx_ct_csv_voucher; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_csv_voucher ON public.ct_chinh_sach_voucher USING btree (voucher_id);


--
-- Name: idx_ct_csvt_vai_tro; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_csvt_vai_tro ON public.ct_chinh_sach_vai_tro USING btree (vai_tro_id);


--
-- Name: idx_ct_dbccs_dot_binh_chon; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_dbccs_dot_binh_chon ON public.ct_dot_binh_chon_chinh_sach USING btree (dot_binh_chon_id);


--
-- Name: idx_ct_knvql_kho; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_knvql_kho ON public.ct_kho_nhan_vien_quan_ly USING btree (kho_id);


--
-- Name: idx_ct_knvql_nhan_vien; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_knvql_nhan_vien ON public.ct_kho_nhan_vien_quan_ly USING btree (nhan_vien_id);


--
-- Name: idx_ct_thuc_don_mon_an_don_vi_tinh_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_thuc_don_mon_an_don_vi_tinh_id ON public.ct_thuc_don_mon_an USING btree (don_vi_tinh_id);


--
-- Name: idx_ct_thuc_don_mon_an_mon_an_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_thuc_don_mon_an_mon_an_id ON public.ct_thuc_don_mon_an USING btree (mon_an_id);


--
-- Name: idx_ct_thuc_don_mon_an_nhom_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_thuc_don_mon_an_nhom_id ON public.ct_thuc_don_mon_an USING btree (thuc_don_nhom_mon_an_id);


--
-- Name: idx_ct_thuc_don_ngay_ngay; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_thuc_don_ngay_ngay ON public.ct_thuc_don_ngay USING btree (ngay);


--
-- Name: idx_ct_thuc_don_ngay_thuc_don_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_thuc_don_ngay_thuc_don_id ON public.ct_thuc_don_ngay USING btree (thuc_don_id);


--
-- Name: idx_ct_thuc_don_nhom_mon_an_ngay_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_thuc_don_nhom_mon_an_ngay_id ON public.ct_thuc_don_nhom_mon_an USING btree (thuc_don_ngay_id);


--
-- Name: idx_ct_thuc_don_nhom_mon_an_nhom_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_thuc_don_nhom_mon_an_nhom_id ON public.ct_thuc_don_nhom_mon_an USING btree (nhom_mon_an_id);


--
-- Name: idx_dm_chinh_sach_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dm_chinh_sach_active ON public.dm_chinh_sach USING btree (active);


--
-- Name: idx_dm_chinh_sach_loai; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dm_chinh_sach_loai ON public.dm_chinh_sach USING btree (loai_chinh_sach);


--
-- Name: idx_dm_thiet_lap_co_so_co_so_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dm_thiet_lap_co_so_co_so_id ON public.dm_thiet_lap_co_so USING btree (co_so_id);


--
-- Name: idx_dm_thiet_lap_co_so_thiet_lap_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dm_thiet_lap_co_so_thiet_lap_id ON public.dm_thiet_lap_co_so USING btree (thiet_lap_id);


--
-- Name: idx_nv_thuc_don_ca_an_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nv_thuc_don_ca_an_id ON public.nv_thuc_don USING btree (ca_an_id);


--
-- Name: idx_nv_thuc_don_co_so_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nv_thuc_don_co_so_id ON public.nv_thuc_don USING btree (co_so_id);


--
-- Name: idx_nv_thuc_don_den_ngay; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nv_thuc_don_den_ngay ON public.nv_thuc_don USING btree (den_ngay);


--
-- Name: idx_nv_thuc_don_nha_an_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nv_thuc_don_nha_an_id ON public.nv_thuc_don USING btree (nha_an_id);


--
-- Name: idx_nv_thuc_don_trang_thai; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nv_thuc_don_trang_thai ON public.nv_thuc_don USING btree (trang_thai);


--
-- Name: idx_nv_thuc_don_tu_ngay; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nv_thuc_don_tu_ngay ON public.nv_thuc_don USING btree (tu_ngay);


--
-- Name: idx_quyen_nhom_nhom_tinh_nang_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quyen_nhom_nhom_tinh_nang_id ON public.dm_quyen_nhom_tinh_nang USING btree (nhom_tinh_nang_id);


--
-- Name: idx_quyen_nhom_quyen_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quyen_nhom_quyen_id ON public.dm_quyen_nhom_tinh_nang USING btree (quyen_id);


--
-- Name: ct_phieu_nhap trg_ct_phieu_nhap_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_ct_phieu_nhap_updated_at BEFORE UPDATE ON public.ct_phieu_nhap FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ct_phieu_xuat trg_ct_phieu_xuat_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_ct_phieu_xuat_updated_at BEFORE UPDATE ON public.ct_phieu_xuat FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: dm_nhan_vien_vai_tro trg_dm_nhan_vien_vai_tro_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_dm_nhan_vien_vai_tro_updated_at BEFORE UPDATE ON public.dm_nhan_vien_vai_tro FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: dm_thiet_lap_co_so trg_dm_thiet_lap_co_so_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_dm_thiet_lap_co_so_updated_at BEFORE UPDATE ON public.dm_thiet_lap_co_so FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: dm_thiet_lap trg_dm_thiet_lap_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_dm_thiet_lap_updated_at BEFORE UPDATE ON public.dm_thiet_lap FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: nv_phieu_nhap trg_nv_phieu_nhap_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_nv_phieu_nhap_updated_at BEFORE UPDATE ON public.nv_phieu_nhap FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: nv_phieu_xuat trg_nv_phieu_xuat_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_nv_phieu_xuat_updated_at BEFORE UPDATE ON public.nv_phieu_xuat FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ton_kho trg_ton_kho_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_ton_kho_updated_at BEFORE UPDATE ON public.ton_kho FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: nv_binh_chon_suat_an fk_binh_chon_dot; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_binh_chon_suat_an
    ADD CONSTRAINT fk_binh_chon_dot FOREIGN KEY (dot_binh_chon_id) REFERENCES public.nv_dot_binh_chon(id);


--
-- Name: nv_binh_chon_suat_an fk_binh_chon_nhan_vien; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_binh_chon_suat_an
    ADD CONSTRAINT fk_binh_chon_nhan_vien FOREIGN KEY (nhan_vien_id) REFERENCES public.dm_nhan_vien(id);


--
-- Name: dm_co_so fk_co_so_quoc_gia; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_co_so
    ADD CONSTRAINT fk_co_so_quoc_gia FOREIGN KEY (quoc_gia_id) REFERENCES public.dm_quoc_gia(id);


--
-- Name: dm_co_so fk_co_so_tinh_thanh; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_co_so
    ADD CONSTRAINT fk_co_so_tinh_thanh FOREIGN KEY (tinh_thanh_id) REFERENCES public.dm_tinh_thanh(id);


--
-- Name: dm_co_so fk_co_so_xa_phuong; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_co_so
    ADD CONSTRAINT fk_co_so_xa_phuong FOREIGN KEY (xa_phuong_id) REFERENCES public.dm_xa_phuong(id);


--
-- Name: ct_binh_chon_suat_an fk_ct_binh_chon; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_binh_chon_suat_an
    ADD CONSTRAINT fk_ct_binh_chon FOREIGN KEY (binh_chon_id) REFERENCES public.nv_binh_chon_suat_an(id);


--
-- Name: ct_chinh_sach_chuc_vu fk_ct_cscv_chinh_sach; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_chinh_sach_chuc_vu
    ADD CONSTRAINT fk_ct_cscv_chinh_sach FOREIGN KEY (chinh_sach_id) REFERENCES public.dm_chinh_sach(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ct_chinh_sach_chuc_vu fk_ct_cscv_chuc_vu; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_chinh_sach_chuc_vu
    ADD CONSTRAINT fk_ct_cscv_chuc_vu FOREIGN KEY (chuc_vu_id) REFERENCES public.dm_chuc_vu(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ct_chinh_sach_tai_khoan fk_ct_cstk_chinh_sach; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_chinh_sach_tai_khoan
    ADD CONSTRAINT fk_ct_cstk_chinh_sach FOREIGN KEY (chinh_sach_id) REFERENCES public.dm_chinh_sach(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ct_chinh_sach_tai_khoan fk_ct_cstk_tai_khoan; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_chinh_sach_tai_khoan
    ADD CONSTRAINT fk_ct_cstk_tai_khoan FOREIGN KEY (tai_khoan_id) REFERENCES public.dm_tai_khoan(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ct_chinh_sach_voucher fk_ct_csv_chinh_sach; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_chinh_sach_voucher
    ADD CONSTRAINT fk_ct_csv_chinh_sach FOREIGN KEY (chinh_sach_id) REFERENCES public.dm_chinh_sach(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ct_chinh_sach_voucher fk_ct_csv_voucher; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_chinh_sach_voucher
    ADD CONSTRAINT fk_ct_csv_voucher FOREIGN KEY (voucher_id) REFERENCES public.dm_voucher(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ct_chinh_sach_vai_tro fk_ct_csvt_chinh_sach; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_chinh_sach_vai_tro
    ADD CONSTRAINT fk_ct_csvt_chinh_sach FOREIGN KEY (chinh_sach_id) REFERENCES public.dm_chinh_sach(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ct_chinh_sach_vai_tro fk_ct_csvt_vai_tro; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_chinh_sach_vai_tro
    ADD CONSTRAINT fk_ct_csvt_vai_tro FOREIGN KEY (vai_tro_id) REFERENCES public.dm_vai_tro(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ct_dot_binh_chon_chinh_sach fk_ct_dbccs_dot_binh_chon; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_dot_binh_chon_chinh_sach
    ADD CONSTRAINT fk_ct_dbccs_dot_binh_chon FOREIGN KEY (dot_binh_chon_id) REFERENCES public.nv_dot_binh_chon(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ct_dot_binh_chon_chinh_sach fk_ct_dot_binh_chon; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_dot_binh_chon_chinh_sach
    ADD CONSTRAINT fk_ct_dot_binh_chon FOREIGN KEY (dot_binh_chon_id) REFERENCES public.nv_dot_binh_chon(id);


--
-- Name: ct_kho_nhan_vien_quan_ly fk_ct_knvql_kho; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_kho_nhan_vien_quan_ly
    ADD CONSTRAINT fk_ct_knvql_kho FOREIGN KEY (kho_id) REFERENCES public.dm_kho(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ct_kho_nhan_vien_quan_ly fk_ct_knvql_nhan_vien; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_kho_nhan_vien_quan_ly
    ADD CONSTRAINT fk_ct_knvql_nhan_vien FOREIGN KEY (nhan_vien_id) REFERENCES public.dm_nhan_vien(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ct_binh_chon_suat_an fk_ct_mon_an; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_binh_chon_suat_an
    ADD CONSTRAINT fk_ct_mon_an FOREIGN KEY (mon_an_id) REFERENCES public.dm_mon_an(id);


--
-- Name: ct_mon_an_thuc_pham fk_ct_mon_an_thuc_pham_mon_an; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_mon_an_thuc_pham
    ADD CONSTRAINT fk_ct_mon_an_thuc_pham_mon_an FOREIGN KEY (mon_an_id) REFERENCES public.dm_mon_an(id) ON DELETE CASCADE;


--
-- Name: ct_mon_an_thuc_pham fk_ct_mon_an_thuc_pham_thuc_pham; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_mon_an_thuc_pham
    ADD CONSTRAINT fk_ct_mon_an_thuc_pham_thuc_pham FOREIGN KEY (thuc_pham_id) REFERENCES public.dm_thuc_pham(id);


--
-- Name: ct_nha_an_nhan_vien fk_ct_nanv_nha_an; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_nha_an_nhan_vien
    ADD CONSTRAINT fk_ct_nanv_nha_an FOREIGN KEY (nha_an_id) REFERENCES public.dm_nha_an(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ct_nha_an_nhan_vien fk_ct_nanv_nhan_vien; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_nha_an_nhan_vien
    ADD CONSTRAINT fk_ct_nanv_nhan_vien FOREIGN KEY (nhan_vien_id) REFERENCES public.dm_nhan_vien(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ct_phieu_nhap fk_ct_pn; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_phieu_nhap
    ADD CONSTRAINT fk_ct_pn FOREIGN KEY (phieu_nhap_id) REFERENCES public.nv_phieu_nhap(id) ON DELETE CASCADE;


--
-- Name: ct_phieu_nhap fk_ct_pn_don_vi_so_cap; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_phieu_nhap
    ADD CONSTRAINT fk_ct_pn_don_vi_so_cap FOREIGN KEY (don_vi_so_cap_id) REFERENCES public.dm_don_vi_tinh(id);


--
-- Name: ct_phieu_nhap fk_ct_pn_tp; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_phieu_nhap
    ADD CONSTRAINT fk_ct_pn_tp FOREIGN KEY (thuc_pham_id) REFERENCES public.dm_thuc_pham(id);


--
-- Name: ct_phieu_xuat fk_ct_px; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_phieu_xuat
    ADD CONSTRAINT fk_ct_px FOREIGN KEY (phieu_xuat_id) REFERENCES public.nv_phieu_xuat(id) ON DELETE CASCADE;


--
-- Name: ct_phieu_xuat fk_ct_px_don_vi_so_cap; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_phieu_xuat
    ADD CONSTRAINT fk_ct_px_don_vi_so_cap FOREIGN KEY (don_vi_so_cap_id) REFERENCES public.dm_don_vi_tinh(id);


--
-- Name: ct_phieu_xuat fk_ct_px_tp; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_phieu_xuat
    ADD CONSTRAINT fk_ct_px_tp FOREIGN KEY (thuc_pham_id) REFERENCES public.dm_thuc_pham(id);


--
-- Name: ct_thuc_don_mon_an fk_ct_thuc_don_mon_an_don_vi_tinh; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_thuc_don_mon_an
    ADD CONSTRAINT fk_ct_thuc_don_mon_an_don_vi_tinh FOREIGN KEY (don_vi_tinh_id) REFERENCES public.dm_don_vi_tinh(id);


--
-- Name: ct_thuc_don_mon_an fk_ct_thuc_don_mon_an_mon_an; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_thuc_don_mon_an
    ADD CONSTRAINT fk_ct_thuc_don_mon_an_mon_an FOREIGN KEY (mon_an_id) REFERENCES public.dm_mon_an(id);


--
-- Name: ct_thuc_don_mon_an fk_ct_thuc_don_mon_an_nhom; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_thuc_don_mon_an
    ADD CONSTRAINT fk_ct_thuc_don_mon_an_nhom FOREIGN KEY (thuc_don_nhom_mon_an_id) REFERENCES public.ct_thuc_don_nhom_mon_an(id) ON DELETE CASCADE;


--
-- Name: ct_thuc_don_ngay fk_ct_thuc_don_ngay_thuc_don; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_thuc_don_ngay
    ADD CONSTRAINT fk_ct_thuc_don_ngay_thuc_don FOREIGN KEY (thuc_don_id) REFERENCES public.nv_thuc_don(id) ON DELETE CASCADE;


--
-- Name: ct_thuc_don_nhom_mon_an fk_ct_thuc_don_nhom_mon_an_ngay; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_thuc_don_nhom_mon_an
    ADD CONSTRAINT fk_ct_thuc_don_nhom_mon_an_ngay FOREIGN KEY (thuc_don_ngay_id) REFERENCES public.ct_thuc_don_ngay(id) ON DELETE CASCADE;


--
-- Name: ct_thuc_don_nhom_mon_an fk_ct_thuc_don_nhom_mon_an_nhom; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_thuc_don_nhom_mon_an
    ADD CONSTRAINT fk_ct_thuc_don_nhom_mon_an_nhom FOREIGN KEY (nhom_mon_an_id) REFERENCES public.dm_nhom_mon_an(id);


--
-- Name: ct_dot_binh_chon_chuc_vu fk_ctbc_chuc_vu; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_dot_binh_chon_chuc_vu
    ADD CONSTRAINT fk_ctbc_chuc_vu FOREIGN KEY (chuc_vu_id) REFERENCES public.dm_chuc_vu(id);


--
-- Name: dm_phong_ban fk_dm_phong_ban_co_so; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_phong_ban
    ADD CONSTRAINT fk_dm_phong_ban_co_so FOREIGN KEY (co_so_id) REFERENCES public.dm_co_so(id);


--
-- Name: dm_tai_khoan fk_dm_tai_khoan_nhan_vien; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_tai_khoan
    ADD CONSTRAINT fk_dm_tai_khoan_nhan_vien FOREIGN KEY (nhan_vien_id) REFERENCES public.dm_nhan_vien(id) ON DELETE CASCADE;


--
-- Name: ct_dot_binh_chon_chuc_vu fk_dot_bc_chuc_vu; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_dot_binh_chon_chuc_vu
    ADD CONSTRAINT fk_dot_bc_chuc_vu FOREIGN KEY (dot_binh_chon_id) REFERENCES public.nv_dot_binh_chon(id);


--
-- Name: ct_dot_binh_chon_mon_an fk_dot_bc_mon_an; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_dot_binh_chon_mon_an
    ADD CONSTRAINT fk_dot_bc_mon_an FOREIGN KEY (dot_binh_chon_id) REFERENCES public.nv_dot_binh_chon(id);


--
-- Name: ct_dot_binh_chon_nhom_mon fk_dot_bc_nhom_mon; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_dot_binh_chon_nhom_mon
    ADD CONSTRAINT fk_dot_bc_nhom_mon FOREIGN KEY (dot_binh_chon_id) REFERENCES public.nv_dot_binh_chon(id);


--
-- Name: nv_dot_binh_chon fk_dot_binh_chon_ca_an; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_dot_binh_chon
    ADD CONSTRAINT fk_dot_binh_chon_ca_an FOREIGN KEY (ca_an_id) REFERENCES public.dm_ca_an(id);


--
-- Name: nv_dot_binh_chon fk_dot_binh_chon_nha_an; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_dot_binh_chon
    ADD CONSTRAINT fk_dot_binh_chon_nha_an FOREIGN KEY (nha_an_id) REFERENCES public.dm_nha_an(id);


--
-- Name: dm_kho fk_kho_nha_an; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_kho
    ADD CONSTRAINT fk_kho_nha_an FOREIGN KEY (nha_an_id) REFERENCES public.dm_nha_an(id);


--
-- Name: ct_dot_binh_chon_mon_an fk_mon_an; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_dot_binh_chon_mon_an
    ADD CONSTRAINT fk_mon_an FOREIGN KEY (mon_an_id) REFERENCES public.dm_mon_an(id);


--
-- Name: dm_mon_an fk_mon_an_nhom_mon; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_mon_an
    ADD CONSTRAINT fk_mon_an_nhom_mon FOREIGN KEY (nhom_mon_an_id) REFERENCES public.dm_nhom_mon_an(id);


--
-- Name: dm_nha_an fk_nha_an_co_so; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nha_an
    ADD CONSTRAINT fk_nha_an_co_so FOREIGN KEY (co_so_id) REFERENCES public.dm_co_so(id);


--
-- Name: dm_nhan_vien fk_nhan_vien_chuc_vu; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhan_vien
    ADD CONSTRAINT fk_nhan_vien_chuc_vu FOREIGN KEY (chuc_vu_id) REFERENCES public.dm_chuc_vu(id);


--
-- Name: dm_nhan_vien fk_nhan_vien_co_so; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhan_vien
    ADD CONSTRAINT fk_nhan_vien_co_so FOREIGN KEY (co_so_id) REFERENCES public.dm_co_so(id);


--
-- Name: dm_nhan_vien fk_nhan_vien_phong_ban; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhan_vien
    ADD CONSTRAINT fk_nhan_vien_phong_ban FOREIGN KEY (phong_ban_id) REFERENCES public.dm_phong_ban(id);


--
-- Name: ct_dot_binh_chon_nhom_mon fk_nhom_mon; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_dot_binh_chon_nhom_mon
    ADD CONSTRAINT fk_nhom_mon FOREIGN KEY (nhom_mon_an_id) REFERENCES public.dm_nhom_mon_an(id);


--
-- Name: dm_nhan_vien fk_nv_quoc_gia; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhan_vien
    ADD CONSTRAINT fk_nv_quoc_gia FOREIGN KEY (quoc_gia_id) REFERENCES public.dm_quoc_gia(id);


--
-- Name: nv_thuc_don fk_nv_thuc_don_ca_an; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thuc_don
    ADD CONSTRAINT fk_nv_thuc_don_ca_an FOREIGN KEY (ca_an_id) REFERENCES public.dm_ca_an(id);


--
-- Name: nv_thuc_don fk_nv_thuc_don_co_so; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thuc_don
    ADD CONSTRAINT fk_nv_thuc_don_co_so FOREIGN KEY (co_so_id) REFERENCES public.dm_co_so(id);


--
-- Name: nv_thuc_don fk_nv_thuc_don_nha_an; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thuc_don
    ADD CONSTRAINT fk_nv_thuc_don_nha_an FOREIGN KEY (nha_an_id) REFERENCES public.dm_nha_an(id);


--
-- Name: dm_nhan_vien fk_nv_tinh_thanh; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhan_vien
    ADD CONSTRAINT fk_nv_tinh_thanh FOREIGN KEY (tinh_thanh_id) REFERENCES public.dm_tinh_thanh(id);


--
-- Name: dm_nhan_vien_vai_tro fk_nv_vai_tro_nhan_vien; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhan_vien_vai_tro
    ADD CONSTRAINT fk_nv_vai_tro_nhan_vien FOREIGN KEY (nhan_vien_id) REFERENCES public.dm_nhan_vien(id) ON DELETE CASCADE;


--
-- Name: dm_nhan_vien_vai_tro fk_nv_vai_tro_vai_tro; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhan_vien_vai_tro
    ADD CONSTRAINT fk_nv_vai_tro_vai_tro FOREIGN KEY (vai_tro_id) REFERENCES public.dm_vai_tro(id) ON DELETE CASCADE;


--
-- Name: dm_nhan_vien fk_nv_xa_phuong; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhan_vien
    ADD CONSTRAINT fk_nv_xa_phuong FOREIGN KEY (xa_phuong_id) REFERENCES public.dm_xa_phuong(id);


--
-- Name: nv_phieu_nhap fk_phieu_nhap_kho; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_phieu_nhap
    ADD CONSTRAINT fk_phieu_nhap_kho FOREIGN KEY (kho_id) REFERENCES public.dm_kho(id);


--
-- Name: nv_phieu_nhap fk_phieu_nhap_nhan_vien; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_phieu_nhap
    ADD CONSTRAINT fk_phieu_nhap_nhan_vien FOREIGN KEY (nhan_vien_id) REFERENCES public.dm_nhan_vien(id);


--
-- Name: nv_phieu_xuat fk_px_kho; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_phieu_xuat
    ADD CONSTRAINT fk_px_kho FOREIGN KEY (kho_id) REFERENCES public.dm_kho(id);


--
-- Name: nv_phieu_xuat fk_px_nv; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_phieu_xuat
    ADD CONSTRAINT fk_px_nv FOREIGN KEY (nhan_vien_id) REFERENCES public.dm_nhan_vien(id);


--
-- Name: dm_quyen_nhom_tinh_nang fk_quyen_nhom_tinh_nang_nhom; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_quyen_nhom_tinh_nang
    ADD CONSTRAINT fk_quyen_nhom_tinh_nang_nhom FOREIGN KEY (nhom_tinh_nang_id) REFERENCES public.dm_nhom_tinh_nang(id);


--
-- Name: dm_quyen_nhom_tinh_nang fk_quyen_nhom_tinh_nang_quyen; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_quyen_nhom_tinh_nang
    ADD CONSTRAINT fk_quyen_nhom_tinh_nang_quyen FOREIGN KEY (quyen_id) REFERENCES public.dm_quyen(id);


--
-- Name: nv_refresh_token fk_refresh_token_tai_khoan; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_refresh_token
    ADD CONSTRAINT fk_refresh_token_tai_khoan FOREIGN KEY (tai_khoan_id) REFERENCES public.dm_tai_khoan(id);


--
-- Name: dm_tai_khoan_vai_tro fk_tai_khoan_vai_tro_tai_khoan; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_tai_khoan_vai_tro
    ADD CONSTRAINT fk_tai_khoan_vai_tro_tai_khoan FOREIGN KEY (tai_khoan_id) REFERENCES public.dm_tai_khoan(id);


--
-- Name: dm_tai_khoan_vai_tro fk_tai_khoan_vai_tro_vai_tro; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_tai_khoan_vai_tro
    ADD CONSTRAINT fk_tai_khoan_vai_tro_vai_tro FOREIGN KEY (vai_tro_id) REFERENCES public.dm_vai_tro(id);


--
-- Name: dm_thiet_lap_co_so fk_thiet_lap_co_so_co_so; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_thiet_lap_co_so
    ADD CONSTRAINT fk_thiet_lap_co_so_co_so FOREIGN KEY (co_so_id) REFERENCES public.dm_co_so(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dm_thiet_lap_co_so fk_thiet_lap_co_so_thiet_lap; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_thiet_lap_co_so
    ADD CONSTRAINT fk_thiet_lap_co_so_thiet_lap FOREIGN KEY (thiet_lap_id) REFERENCES public.dm_thiet_lap(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dm_thiet_lap_nhom_tinh_nang fk_thiet_lap_nhom_tinh_nang_nhom; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_thiet_lap_nhom_tinh_nang
    ADD CONSTRAINT fk_thiet_lap_nhom_tinh_nang_nhom FOREIGN KEY (nhom_tinh_nang_id) REFERENCES public.dm_nhom_tinh_nang(id);


--
-- Name: dm_thiet_lap_nhom_tinh_nang fk_thiet_lap_nhom_tinh_nang_thiet_lap; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_thiet_lap_nhom_tinh_nang
    ADD CONSTRAINT fk_thiet_lap_nhom_tinh_nang_thiet_lap FOREIGN KEY (thiet_lap_id) REFERENCES public.dm_thiet_lap(id);


--
-- Name: dm_thuc_pham fk_thuc_pham_xuat_xu; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_thuc_pham
    ADD CONSTRAINT fk_thuc_pham_xuat_xu FOREIGN KEY (xuat_xu_id) REFERENCES public.dm_quoc_gia(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dm_tinh_thanh fk_tinh_thanh_quoc_gia; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_tinh_thanh
    ADD CONSTRAINT fk_tinh_thanh_quoc_gia FOREIGN KEY (quoc_gia_id) REFERENCES public.dm_quoc_gia(id);


--
-- Name: ton_kho fk_ton_kho; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ton_kho
    ADD CONSTRAINT fk_ton_kho FOREIGN KEY (kho_id) REFERENCES public.dm_kho(id);


--
-- Name: ton_kho fk_ton_kho_last_pn; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ton_kho
    ADD CONSTRAINT fk_ton_kho_last_pn FOREIGN KEY (last_phieu_nhap_id) REFERENCES public.nv_phieu_nhap(id);


--
-- Name: ton_kho fk_ton_kho_last_px; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ton_kho
    ADD CONSTRAINT fk_ton_kho_last_px FOREIGN KEY (last_phieu_xuat_id) REFERENCES public.nv_phieu_xuat(id);


--
-- Name: ton_kho fk_ton_tp; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ton_kho
    ADD CONSTRAINT fk_ton_tp FOREIGN KEY (thuc_pham_id) REFERENCES public.dm_thuc_pham(id);


--
-- Name: dm_thuc_pham fk_tp_dv_so_cap; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_thuc_pham
    ADD CONSTRAINT fk_tp_dv_so_cap FOREIGN KEY (don_vi_so_cap_id) REFERENCES public.dm_don_vi_tinh(id);


--
-- Name: dm_thuc_pham fk_tp_dv_su_dung; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_thuc_pham
    ADD CONSTRAINT fk_tp_dv_su_dung FOREIGN KEY (don_vi_su_dung_id) REFERENCES public.dm_don_vi_tinh(id);


--
-- Name: dm_vai_tro_quyen fk_vai_tro_quyen_quyen; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_vai_tro_quyen
    ADD CONSTRAINT fk_vai_tro_quyen_quyen FOREIGN KEY (quyen_id) REFERENCES public.dm_quyen(id);


--
-- Name: dm_vai_tro_quyen fk_vai_tro_quyen_vai_tro; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_vai_tro_quyen
    ADD CONSTRAINT fk_vai_tro_quyen_vai_tro FOREIGN KEY (vai_tro_id) REFERENCES public.dm_vai_tro(id);


--
-- Name: dm_xa_phuong fk_xa_phuong_tinh_thanh; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_xa_phuong
    ADD CONSTRAINT fk_xa_phuong_tinh_thanh FOREIGN KEY (tinh_thanh_id) REFERENCES public.dm_tinh_thanh(id);


--
-- PostgreSQL database dump complete
--

\unrestrict Ep3byRdBqrTbmuNn1Hr8vuClnAtVovnz4rjgJOURxmGkfYinRYVlGbFusKL1Yst

