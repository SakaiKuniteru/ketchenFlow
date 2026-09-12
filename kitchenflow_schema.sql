--
-- PostgreSQL database dump
--

\restrict J204Ujflee9jWkyBe0GrrzblDOUSGEmHttWTXMz9YObYhhwCqazZOsAVnRqVtdf

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
    id bigint NOT NULL,
    dot_binh_chon_id bigint NOT NULL,
    tai_khoan_id bigint NOT NULL,
    lua_chon boolean NOT NULL,
    thoi_gian_binh_chon timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ct_binh_chon_suat_an_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ct_binh_chon_suat_an_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ct_binh_chon_suat_an_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ct_binh_chon_suat_an_id_seq OWNED BY public.ct_binh_chon_suat_an.id;


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
-- Name: ct_don_hang; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_don_hang (
    id bigint NOT NULL,
    don_hang_id bigint NOT NULL,
    san_pham_id bigint NOT NULL,
    ma_san_pham_snapshot character varying(50) NOT NULL,
    ten_san_pham_snapshot character varying(255) NOT NULL,
    ten_nhom_snapshot character varying(150),
    don_vi_snapshot character varying(100),
    hinh_anh_snapshot text,
    so_luong numeric(18,6) NOT NULL,
    don_gia numeric(18,6) NOT NULL,
    tien_giam numeric(18,6) DEFAULT 0 NOT NULL,
    thanh_tien numeric(18,6) NOT NULL,
    ghi_chu character varying(500),
    trang_thai integer DEFAULT 10 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_ct_don_hang_so_luong CHECK ((so_luong > (0)::numeric)),
    CONSTRAINT chk_ct_don_hang_tien CHECK (((don_gia >= (0)::numeric) AND (tien_giam >= (0)::numeric) AND (thanh_tien >= (0)::numeric) AND (tien_giam <= (so_luong * don_gia)) AND (thanh_tien = ((so_luong * don_gia) - tien_giam)))),
    CONSTRAINT chk_ct_don_hang_trang_thai CHECK ((trang_thai = ANY (ARRAY['-10'::integer, 10, 20, 30])))
);


--
-- Name: COLUMN ct_don_hang.trang_thai; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.ct_don_hang.trang_thai IS '-10=Huy dong, 10=Cho xu ly, 20=Dang chuan bi, 30=Hoan thanh';


--
-- Name: ct_don_hang_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ct_don_hang_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ct_don_hang_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ct_don_hang_id_seq OWNED BY public.ct_don_hang.id;


--
-- Name: ct_don_hang_voucher; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_don_hang_voucher (
    id bigint NOT NULL,
    don_hang_id bigint NOT NULL,
    voucher_don_hang_id bigint NOT NULL,
    ma_voucher_snapshot character varying(50) NOT NULL,
    ten_voucher_snapshot character varying(255) NOT NULL,
    loai_giam_snapshot integer NOT NULL,
    gia_tri_snapshot numeric(18,6) NOT NULL,
    so_tien_du_dieu_kien numeric(18,6) NOT NULL,
    so_tien_giam numeric(18,6) NOT NULL,
    thu_tu_ap_dung integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_ct_don_hang_voucher_loai CHECK ((loai_giam_snapshot = ANY (ARRAY[10, 20, 30]))),
    CONSTRAINT chk_ct_don_hang_voucher_thu_tu CHECK ((thu_tu_ap_dung > 0)),
    CONSTRAINT chk_ct_don_hang_voucher_tien CHECK (((gia_tri_snapshot > (0)::numeric) AND (so_tien_du_dieu_kien >= (0)::numeric) AND (so_tien_giam >= (0)::numeric) AND (so_tien_giam <= so_tien_du_dieu_kien)))
);


--
-- Name: ct_don_hang_voucher_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ct_don_hang_voucher_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ct_don_hang_voucher_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ct_don_hang_voucher_id_seq OWNED BY public.ct_don_hang_voucher.id;


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
-- Name: ct_phieu_lay_ve_mien_giam; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_phieu_lay_ve_mien_giam (
    id bigint NOT NULL,
    phieu_lay_ve_id bigint NOT NULL,
    chinh_sach_id bigint,
    voucher_id integer,
    ma_mien_giam character varying(50),
    ten_mien_giam character varying(255) NOT NULL,
    loai_mien_giam integer NOT NULL,
    gia_tri numeric(18,6) NOT NULL,
    so_tien_truoc_giam numeric(18,2) NOT NULL,
    so_tien_giam numeric(18,2) NOT NULL,
    so_tien_sau_giam numeric(18,2) NOT NULL,
    thu_tu_ap_dung integer DEFAULT 1 NOT NULL,
    ly_do_mien_giam character varying(500),
    nguoi_tao_mien_giam_id integer,
    nguoi_ap_mien_giam_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_ct_phieu_lay_ve_mien_giam_gia_tri CHECK ((gia_tri >= (0)::numeric)),
    CONSTRAINT chk_ct_phieu_lay_ve_mien_giam_loai CHECK ((loai_mien_giam = ANY (ARRAY[10, 20]))),
    CONSTRAINT chk_ct_phieu_lay_ve_mien_giam_nguon CHECK ((((chinh_sach_id IS NULL) AND (voucher_id IS NULL)) OR ((chinh_sach_id IS NULL) AND (voucher_id IS NOT NULL)) OR ((chinh_sach_id IS NOT NULL) AND (voucher_id IS NOT NULL)))),
    CONSTRAINT chk_ct_phieu_lay_ve_mien_giam_so_tien CHECK (((so_tien_truoc_giam >= (0)::numeric) AND (so_tien_giam >= (0)::numeric) AND (so_tien_sau_giam >= (0)::numeric))),
    CONSTRAINT chk_ct_phieu_lay_ve_mien_giam_thu_tu CHECK ((thu_tu_ap_dung > 0))
);


--
-- Name: ct_phieu_lay_ve_mien_giam_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ct_phieu_lay_ve_mien_giam_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ct_phieu_lay_ve_mien_giam_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ct_phieu_lay_ve_mien_giam_id_seq OWNED BY public.ct_phieu_lay_ve_mien_giam.id;


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
-- Name: ct_san_pham_co_so; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_san_pham_co_so (
    id bigint NOT NULL,
    san_pham_id bigint NOT NULL,
    co_so_id integer NOT NULL,
    gia_ban numeric(18,6),
    so_luong_toi_da_moi_don numeric(18,6),
    cho_phep_dat boolean DEFAULT true NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_ct_san_pham_co_so_gia CHECK (((gia_ban IS NULL) OR (gia_ban >= (0)::numeric))),
    CONSTRAINT chk_ct_san_pham_co_so_so_luong CHECK (((so_luong_toi_da_moi_don IS NULL) OR (so_luong_toi_da_moi_don > (0)::numeric)))
);


--
-- Name: ct_san_pham_co_so_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ct_san_pham_co_so_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ct_san_pham_co_so_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ct_san_pham_co_so_id_seq OWNED BY public.ct_san_pham_co_so.id;


--
-- Name: ct_thong_bao_doi_tuong; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_thong_bao_doi_tuong (
    thong_bao_id integer NOT NULL,
    loai_doi_tuong smallint NOT NULL,
    doi_tuong_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_ct_thong_bao_loai_doi_tuong CHECK ((loai_doi_tuong = ANY (ARRAY[10, 20, 30])))
);


--
-- Name: ct_thong_bao_nguoi_nhan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_thong_bao_nguoi_nhan (
    thong_bao_id integer NOT NULL,
    tai_khoan_id integer NOT NULL,
    da_doc boolean DEFAULT false NOT NULL,
    thoi_gian_doc timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_ct_thong_bao_thoi_gian_doc CHECK ((((da_doc = false) AND (thoi_gian_doc IS NULL)) OR (da_doc = true)))
);


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
-- Name: ct_ve_an; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_ve_an (
    id bigint NOT NULL,
    phieu_lay_ve_id bigint NOT NULL,
    thuc_don_ngay_id bigint NOT NULL,
    so_thu_tu integer NOT NULL,
    ma_ve character varying(100) NOT NULL,
    qr_token character varying(255) NOT NULL,
    trang_thai integer DEFAULT 10 NOT NULL,
    thoi_gian_su_dung timestamp without time zone,
    nguoi_xac_nhan_id integer,
    nguoi_huy_id integer,
    thoi_gian_huy timestamp without time zone,
    ly_do_huy character varying(500),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_ct_ve_an_so_thu_tu CHECK ((so_thu_tu > 0)),
    CONSTRAINT chk_ct_ve_an_trang_thai CHECK ((trang_thai = ANY (ARRAY[10, 20, 30, 40])))
);


--
-- Name: ct_ve_an_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ct_ve_an_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ct_ve_an_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ct_ve_an_id_seq OWNED BY public.ct_ve_an.id;


--
-- Name: ct_voucher_don_hang_chuc_vu; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_voucher_don_hang_chuc_vu (
    voucher_don_hang_id bigint NOT NULL,
    chuc_vu_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ct_voucher_don_hang_co_so; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_voucher_don_hang_co_so (
    voucher_don_hang_id bigint NOT NULL,
    co_so_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ct_voucher_don_hang_nha_an; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_voucher_don_hang_nha_an (
    id bigint NOT NULL,
    voucher_don_hang_id bigint NOT NULL,
    nha_an_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ct_voucher_don_hang_nha_an_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ct_voucher_don_hang_nha_an_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ct_voucher_don_hang_nha_an_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ct_voucher_don_hang_nha_an_id_seq OWNED BY public.ct_voucher_don_hang_nha_an.id;


--
-- Name: ct_voucher_don_hang_nhan_vien; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_voucher_don_hang_nhan_vien (
    voucher_don_hang_id bigint NOT NULL,
    nhan_vien_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ct_voucher_don_hang_nhom_san_pham; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_voucher_don_hang_nhom_san_pham (
    voucher_don_hang_id bigint NOT NULL,
    nhom_san_pham_id bigint NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ct_voucher_don_hang_phong_ban; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_voucher_don_hang_phong_ban (
    voucher_don_hang_id bigint NOT NULL,
    phong_ban_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ct_voucher_don_hang_san_pham; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ct_voucher_don_hang_san_pham (
    voucher_don_hang_id bigint NOT NULL,
    san_pham_id bigint NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


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
    muc_do_uu_tien integer DEFAULT 1 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_dm_chinh_sach_loai CHECK ((loai_chinh_sach = ANY (ARRAY[10, 20, 30]))),
    CONSTRAINT chk_dm_chinh_sach_uu_tien CHECK ((muc_do_uu_tien > 0))
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
-- Name: dm_dia_diem_nhan_hang; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_dia_diem_nhan_hang (
    id bigint NOT NULL,
    nhan_vien_id integer NOT NULL,
    ma_dia_diem character varying(50) NOT NULL,
    ten_dia_diem character varying(255) NOT NULL,
    dia_chi_chi_tiet character varying(500) NOT NULL,
    loai_dia_diem integer DEFAULT 20 NOT NULL,
    la_mac_dinh boolean DEFAULT false NOT NULL,
    ghi_chu character varying(500),
    thu_tu_hien_thi integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    nhan_vien_ap_dung_id integer,
    CONSTRAINT chk_dm_dia_diem_nhan_hang_loai CHECK ((loai_dia_diem = ANY (ARRAY[10, 20]))),
    CONSTRAINT chk_dm_dia_diem_nhan_hang_thu_tu CHECK ((thu_tu_hien_thi >= 0))
);


--
-- Name: TABLE dm_dia_diem_nhan_hang; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.dm_dia_diem_nhan_hang IS 'Sổ địa điểm nhận hàng được lưu riêng theo từng nhân viên';


--
-- Name: COLUMN dm_dia_diem_nhan_hang.loai_dia_diem; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dm_dia_diem_nhan_hang.loai_dia_diem IS '10=Địa điểm cố định, 20=Địa điểm ghi nhớ';


--
-- Name: COLUMN dm_dia_diem_nhan_hang.la_mac_dinh; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dm_dia_diem_nhan_hang.la_mac_dinh IS 'TRUE=Địa điểm được tự động chọn khi nhân viên đặt hàng';


--
-- Name: dm_dia_diem_nhan_hang_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_dia_diem_nhan_hang_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_dia_diem_nhan_hang_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_dia_diem_nhan_hang_id_seq OWNED BY public.dm_dia_diem_nhan_hang.id;


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
-- Name: dm_gia_ve_an; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_gia_ve_an (
    id bigint NOT NULL,
    doi_tuong_lay_ve integer NOT NULL,
    co_so_id integer,
    nha_an_id integer,
    ca_an_id integer,
    don_gia numeric(18,6) NOT NULL,
    tu_ngay date NOT NULL,
    den_ngay date,
    muc_do_uu_tien integer DEFAULT 1 NOT NULL,
    ghi_chu character varying(500),
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_dm_gia_ve_an_doi_tuong CHECK ((doi_tuong_lay_ve = ANY (ARRAY[10, 20, 30]))),
    CONSTRAINT chk_dm_gia_ve_an_don_gia CHECK ((don_gia >= (0)::numeric)),
    CONSTRAINT chk_dm_gia_ve_an_thoi_gian CHECK (((den_ngay IS NULL) OR (tu_ngay <= den_ngay))),
    CONSTRAINT chk_dm_gia_ve_an_uu_tien CHECK ((muc_do_uu_tien > 0))
);


--
-- Name: dm_gia_ve_an_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_gia_ve_an_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_gia_ve_an_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_gia_ve_an_id_seq OWNED BY public.dm_gia_ve_an.id;


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
-- Name: dm_khung_gio_nhan_hang; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_khung_gio_nhan_hang (
    id bigint NOT NULL,
    ma_khung_gio character varying(50) NOT NULL,
    ten_khung_gio character varying(150) NOT NULL,
    co_so_id integer NOT NULL,
    gio_bat_dau time without time zone NOT NULL,
    gio_ket_thuc time without time zone NOT NULL,
    so_don_toi_da numeric(18,6),
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_dm_khung_gio_nhan_hang_gio CHECK ((gio_bat_dau < gio_ket_thuc)),
    CONSTRAINT chk_dm_khung_gio_nhan_hang_so_don CHECK (((so_don_toi_da IS NULL) OR (so_don_toi_da > (0)::numeric)))
);


--
-- Name: dm_khung_gio_nhan_hang_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_khung_gio_nhan_hang_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_khung_gio_nhan_hang_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_khung_gio_nhan_hang_id_seq OWNED BY public.dm_khung_gio_nhan_hang.id;


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
-- Name: dm_nhom_san_pham; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_nhom_san_pham (
    id bigint NOT NULL,
    ma_nhom_san_pham character varying(50) NOT NULL,
    ten_nhom_san_pham character varying(150) NOT NULL,
    loai_san_pham integer NOT NULL,
    mo_ta character varying(500),
    thu_tu_hien_thi integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_dm_nhom_san_pham_loai CHECK ((loai_san_pham = ANY (ARRAY[10, 20, 30, 40])))
);


--
-- Name: COLUMN dm_nhom_san_pham.loai_san_pham; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dm_nhom_san_pham.loai_san_pham IS '10=Do an, 20=Do uong, 30=Trang mieng, 40=Dich vu khac';


--
-- Name: dm_nhom_san_pham_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_nhom_san_pham_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_nhom_san_pham_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_nhom_san_pham_id_seq OWNED BY public.dm_nhom_san_pham.id;


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
-- Name: dm_san_pham; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_san_pham (
    id bigint NOT NULL,
    ma_san_pham character varying(50) NOT NULL,
    ten_san_pham character varying(255) NOT NULL,
    nhom_san_pham_id bigint NOT NULL,
    don_vi_tinh_id integer,
    gia_ban numeric(18,6) DEFAULT 0 NOT NULL,
    mo_ta character varying(500),
    hinh_anh text,
    cho_phep_dat boolean DEFAULT true NOT NULL,
    la_san_pham_moi boolean DEFAULT false NOT NULL,
    la_san_pham_noi_bat boolean DEFAULT false NOT NULL,
    so_luong_toi_thieu numeric(18,6) DEFAULT 1 NOT NULL,
    so_luong_toi_da numeric(18,6),
    buoc_so_luong numeric(18,6) DEFAULT 1 NOT NULL,
    thoi_gian_chuan_bi_phut integer DEFAULT 0 NOT NULL,
    thu_tu_hien_thi integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_dm_san_pham_chuan_bi CHECK ((thoi_gian_chuan_bi_phut >= 0)),
    CONSTRAINT chk_dm_san_pham_gia CHECK ((gia_ban >= (0)::numeric)),
    CONSTRAINT chk_dm_san_pham_so_luong CHECK (((so_luong_toi_thieu > (0)::numeric) AND (buoc_so_luong > (0)::numeric) AND ((so_luong_toi_da IS NULL) OR (so_luong_toi_da >= so_luong_toi_thieu))))
);


--
-- Name: dm_san_pham_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_san_pham_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_san_pham_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_san_pham_id_seq OWNED BY public.dm_san_pham.id;


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
    mo_ta character varying(2000),
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
-- Name: dm_voucher_don_hang; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dm_voucher_don_hang (
    id bigint NOT NULL,
    ma_voucher character varying(50) NOT NULL,
    ten_voucher character varying(255) NOT NULL,
    mo_ta character varying(1000),
    loai_giam integer NOT NULL,
    gia_tri numeric(18,6) NOT NULL,
    giam_toi_da numeric(18,6),
    gia_tri_don_hang_toi_thieu numeric(18,6) DEFAULT 0 NOT NULL,
    so_luong_phat_hanh integer,
    so_luot_moi_nhan_vien integer DEFAULT 1,
    pham_vi_ap_dung integer DEFAULT 10 NOT NULL,
    cho_phep_dung_chung boolean DEFAULT false NOT NULL,
    tu_dong_ap_dung boolean DEFAULT false NOT NULL,
    thoi_gian_bat_dau timestamp without time zone NOT NULL,
    thoi_gian_ket_thuc timestamp without time zone NOT NULL,
    nguoi_tao_id integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_dm_voucher_don_hang_gia_tri CHECK (((gia_tri > (0)::numeric) AND (gia_tri_don_hang_toi_thieu >= (0)::numeric) AND ((giam_toi_da IS NULL) OR (giam_toi_da >= (0)::numeric)))),
    CONSTRAINT chk_dm_voucher_don_hang_loai CHECK ((loai_giam = ANY (ARRAY[10, 20, 30]))),
    CONSTRAINT chk_dm_voucher_don_hang_luot CHECK (((so_luot_moi_nhan_vien IS NULL) OR (so_luot_moi_nhan_vien > 0))),
    CONSTRAINT chk_dm_voucher_don_hang_pham_vi CHECK ((pham_vi_ap_dung = ANY (ARRAY[10, 20, 30]))),
    CONSTRAINT chk_dm_voucher_don_hang_phan_tram CHECK (((loai_giam <> 10) OR (gia_tri <= (100)::numeric))),
    CONSTRAINT chk_dm_voucher_don_hang_so_luong CHECK (((so_luong_phat_hanh IS NULL) OR (so_luong_phat_hanh > 0))),
    CONSTRAINT chk_dm_voucher_don_hang_thoi_gian CHECK ((thoi_gian_bat_dau < thoi_gian_ket_thuc))
);


--
-- Name: COLUMN dm_voucher_don_hang.loai_giam; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dm_voucher_don_hang.loai_giam IS '10=Phan tram, 20=So tien co dinh, 30=Mien phi dich vu';


--
-- Name: COLUMN dm_voucher_don_hang.pham_vi_ap_dung; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.dm_voucher_don_hang.pham_vi_ap_dung IS '10=Toan don, 20=Nhom san pham, 30=San pham cu the';


--
-- Name: dm_voucher_don_hang_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dm_voucher_don_hang_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dm_voucher_don_hang_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dm_voucher_don_hang_id_seq OWNED BY public.dm_voucher_don_hang.id;


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
-- Name: nv_don_hang; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nv_don_hang (
    id bigint NOT NULL,
    ma_don_hang character varying(50) NOT NULL,
    nguoi_dat_id integer NOT NULL,
    phong_ban_id integer,
    co_so_id integer NOT NULL,
    dat_ho boolean DEFAULT false NOT NULL,
    nguoi_nhan_id integer,
    ten_nguoi_nhan character varying(150) NOT NULL,
    so_dien_thoai_nguoi_nhan character varying(20) NOT NULL,
    dia_diem_nhan_id bigint,
    dia_chi_nhan_snapshot character varying(500) NOT NULL,
    khung_gio_nhan_id bigint,
    thoi_gian_nhan_tu timestamp without time zone NOT NULL,
    thoi_gian_nhan_den timestamp without time zone NOT NULL,
    ghi_chu character varying(1000),
    tam_tinh numeric(18,6) DEFAULT 0 NOT NULL,
    tong_mien_giam numeric(18,6) DEFAULT 0 NOT NULL,
    phi_dich_vu numeric(18,6) DEFAULT 0 NOT NULL,
    tong_thanh_toan numeric(18,6) DEFAULT 0 NOT NULL,
    phuong_thuc_thanh_toan integer NOT NULL,
    trang_thai_thanh_toan integer DEFAULT 10 NOT NULL,
    trang_thai integer DEFAULT 20 NOT NULL,
    nguoi_xu_ly_id integer,
    thoi_gian_tiep_nhan timestamp without time zone,
    nguoi_huy_id integer,
    thoi_gian_huy timestamp without time zone,
    ly_do_huy character varying(500),
    version integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    ten_dia_diem_nhan_snapshot character varying(255) NOT NULL,
    CONSTRAINT chk_nv_don_hang_phuong_thuc CHECK ((phuong_thuc_thanh_toan = ANY (ARRAY[10, 20, 30, 40]))),
    CONSTRAINT chk_nv_don_hang_thanh_toan CHECK ((trang_thai_thanh_toan = ANY (ARRAY[10, 20, 30, 40, 50]))),
    CONSTRAINT chk_nv_don_hang_thoi_gian CHECK ((thoi_gian_nhan_tu < thoi_gian_nhan_den)),
    CONSTRAINT chk_nv_don_hang_tien CHECK (((tam_tinh >= (0)::numeric) AND (tong_mien_giam >= (0)::numeric) AND (phi_dich_vu >= (0)::numeric) AND (tong_thanh_toan >= (0)::numeric) AND (tong_mien_giam <= tam_tinh) AND (tong_thanh_toan = ((tam_tinh - tong_mien_giam) + phi_dich_vu)))),
    CONSTRAINT chk_nv_don_hang_trang_thai CHECK ((trang_thai = ANY (ARRAY['-20'::integer, '-10'::integer, 10, 20, 30, 40, 50, 60, 70]))),
    CONSTRAINT chk_nv_don_hang_version CHECK ((version > 0))
);


--
-- Name: COLUMN nv_don_hang.phuong_thuc_thanh_toan; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nv_don_hang.phuong_thuc_thanh_toan IS '10=Noi bo, 20=Tien mat, 30=Chuyen khoan, 40=QR';


--
-- Name: COLUMN nv_don_hang.trang_thai_thanh_toan; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nv_don_hang.trang_thai_thanh_toan IS '10=Chua thanh toan, 20=Cho thanh toan, 30=Da thanh toan, 40=That bai, 50=Da hoan tien';


--
-- Name: COLUMN nv_don_hang.trang_thai; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nv_don_hang.trang_thai IS '-20=Tu choi, -10=Da huy, 10=Nhap, 20=Cho xac nhan, 30=Dang chuan bi, 40=San sang giao, 50=Dang giao, 60=Hoan thanh, 70=Dong don';


--
-- Name: nv_don_hang_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nv_don_hang_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: nv_don_hang_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nv_don_hang_id_seq OWNED BY public.nv_don_hang.id;


--
-- Name: nv_dot_binh_chon; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nv_dot_binh_chon (
    id bigint NOT NULL,
    thuc_don_ngay_id bigint NOT NULL,
    bat_dau_binh_chon timestamp without time zone NOT NULL,
    han_binh_chon timestamp without time zone NOT NULL,
    cho_phep_thay_doi boolean DEFAULT true NOT NULL,
    nguoi_tao_id bigint,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    trang_thai integer DEFAULT 10 NOT NULL,
    nguoi_gui_id bigint,
    thoi_gian_gui timestamp without time zone,
    nguoi_huy_id bigint,
    thoi_gian_huy timestamp without time zone,
    ly_do_huy character varying(500),
    CONSTRAINT chk_nv_dot_binh_chon_thoi_gian CHECK ((bat_dau_binh_chon < han_binh_chon)),
    CONSTRAINT chk_nv_dot_binh_chon_trang_thai CHECK ((trang_thai = ANY (ARRAY[10, 20, 30])))
);


--
-- Name: nv_dot_binh_chon_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nv_dot_binh_chon_id_seq
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
-- Name: nv_lich_su_don_hang; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nv_lich_su_don_hang (
    id bigint NOT NULL,
    don_hang_id bigint NOT NULL,
    trang_thai_cu integer,
    trang_thai_moi integer NOT NULL,
    hanh_dong character varying(100) NOT NULL,
    noi_dung character varying(500),
    nguoi_thuc_hien_id integer,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_nv_lich_su_don_hang_trang_thai_cu CHECK (((trang_thai_cu IS NULL) OR (trang_thai_cu = ANY (ARRAY['-20'::integer, '-10'::integer, 10, 20, 30, 40, 50, 60, 70])))),
    CONSTRAINT chk_nv_lich_su_don_hang_trang_thai_moi CHECK ((trang_thai_moi = ANY (ARRAY['-20'::integer, '-10'::integer, 10, 20, 30, 40, 50, 60, 70])))
);


--
-- Name: nv_lich_su_don_hang_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nv_lich_su_don_hang_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: nv_lich_su_don_hang_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nv_lich_su_don_hang_id_seq OWNED BY public.nv_lich_su_don_hang.id;


--
-- Name: nv_phieu_lay_ve_an; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nv_phieu_lay_ve_an (
    id bigint NOT NULL,
    so_phieu character varying(50) NOT NULL,
    thuc_don_ngay_id bigint NOT NULL,
    doi_tuong_lay_ve integer NOT NULL,
    nhan_vien_id integer,
    ho_ten_nguoi_lay_ve character varying(150),
    ngay_sinh_nguoi_lay_ve date,
    gioi_tinh_nguoi_lay_ve smallint,
    so_dien_thoai_nguoi_lay_ve character varying(20),
    dia_chi_nguoi_lay_ve text,
    don_vi_nguoi_lay_ve character varying(255),
    khach_lau_dai boolean DEFAULT false NOT NULL,
    so_luong integer DEFAULT 1 NOT NULL,
    don_gia numeric(18,2) NOT NULL,
    tien_goc numeric(18,2) NOT NULL,
    tong_mien_giam numeric(18,2) DEFAULT 0 NOT NULL,
    thanh_tien numeric(18,2) NOT NULL,
    ghi_chu character varying(1000),
    phuong_thuc_thanh_toan integer,
    trang_thai integer DEFAULT 0 NOT NULL,
    nguoi_tao_id integer NOT NULL,
    nguoi_thanh_toan_id integer,
    thoi_gian_thanh_toan timestamp without time zone,
    nguoi_huy_id integer,
    thoi_gian_huy timestamp without time zone,
    ly_do_huy character varying(500),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    phieu_goc_id bigint,
    CONSTRAINT chk_nv_phieu_lay_ve_an_doi_tuong CHECK ((doi_tuong_lay_ve = ANY (ARRAY[10, 20, 30]))),
    CONSTRAINT chk_nv_phieu_lay_ve_an_don_gia CHECK ((don_gia >= (0)::numeric)),
    CONSTRAINT chk_nv_phieu_lay_ve_an_gioi_tinh CHECK (((gioi_tinh_nguoi_lay_ve IS NULL) OR (gioi_tinh_nguoi_lay_ve = ANY (ARRAY[0, 1, 2])))),
    CONSTRAINT chk_nv_phieu_lay_ve_an_nguoi_lay CHECK ((((doi_tuong_lay_ve = 10) AND (nhan_vien_id IS NOT NULL)) OR ((doi_tuong_lay_ve = ANY (ARRAY[20, 30])) AND (nhan_vien_id IS NULL) AND (ho_ten_nguoi_lay_ve IS NOT NULL)))),
    CONSTRAINT chk_nv_phieu_lay_ve_an_phuong_thuc CHECK (((phuong_thuc_thanh_toan IS NULL) OR (phuong_thuc_thanh_toan = ANY (ARRAY[10, 20, 30])))),
    CONSTRAINT chk_nv_phieu_lay_ve_an_so_luong CHECK ((so_luong > 0)),
    CONSTRAINT chk_nv_phieu_lay_ve_an_thanh_tien CHECK ((thanh_tien >= (0)::numeric)),
    CONSTRAINT chk_nv_phieu_lay_ve_an_tien_goc CHECK ((tien_goc >= (0)::numeric)),
    CONSTRAINT chk_nv_phieu_lay_ve_an_tong_mien_giam CHECK ((tong_mien_giam >= (0)::numeric)),
    CONSTRAINT chk_nv_phieu_lay_ve_an_trang_thai CHECK ((trang_thai = ANY (ARRAY['-10'::integer, 0, 10, 20, 30, 40, 50, 60])))
);


--
-- Name: nv_phieu_lay_ve_an_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nv_phieu_lay_ve_an_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: nv_phieu_lay_ve_an_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nv_phieu_lay_ve_an_id_seq OWNED BY public.nv_phieu_lay_ve_an.id;


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
-- Name: nv_thanh_toan_don_hang; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nv_thanh_toan_don_hang (
    id bigint NOT NULL,
    don_hang_id bigint NOT NULL,
    loai_giao_dich integer NOT NULL,
    phuong_thuc integer NOT NULL,
    so_tien numeric(18,6) NOT NULL,
    thanh_toan_goc_id bigint,
    ma_giao_dich character varying(100),
    ma_tham_chieu character varying(100),
    ma_chuan_chi character varying(100),
    qr_payload text,
    qr_het_han_luc timestamp without time zone,
    trang_thai integer DEFAULT 10 NOT NULL,
    noi_dung_loi character varying(1000),
    nguoi_khoi_tao_id integer NOT NULL,
    nguoi_xac_nhan_id integer,
    thoi_gian_thanh_toan timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_nv_thanh_toan_don_hang_loai CHECK ((loai_giao_dich = ANY (ARRAY[10, 20]))),
    CONSTRAINT chk_nv_thanh_toan_don_hang_phuong_thuc CHECK ((phuong_thuc = ANY (ARRAY[10, 20, 30, 40]))),
    CONSTRAINT chk_nv_thanh_toan_don_hang_tien CHECK ((so_tien >= (0)::numeric)),
    CONSTRAINT chk_nv_thanh_toan_don_hang_trang_thai CHECK ((trang_thai = ANY (ARRAY[10, 20, 30, 40, 50])))
);


--
-- Name: COLUMN nv_thanh_toan_don_hang.loai_giao_dich; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nv_thanh_toan_don_hang.loai_giao_dich IS '10=Thanh toan, 20=Hoan tien';


--
-- Name: COLUMN nv_thanh_toan_don_hang.trang_thai; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nv_thanh_toan_don_hang.trang_thai IS '10=Khoi tao, 20=Cho xu ly, 30=Thanh cong, 40=That bai, 50=Da huy';


--
-- Name: nv_thanh_toan_don_hang_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nv_thanh_toan_don_hang_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: nv_thanh_toan_don_hang_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nv_thanh_toan_don_hang_id_seq OWNED BY public.nv_thanh_toan_don_hang.id;


--
-- Name: nv_thanh_toan_ve_an; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nv_thanh_toan_ve_an (
    id bigint NOT NULL,
    phieu_lay_ve_id bigint NOT NULL,
    loai_giao_dich integer NOT NULL,
    phuong_thuc integer NOT NULL,
    so_tien numeric(18,2) NOT NULL,
    ma_giao_dich character varying(100),
    ma_tham_chieu character varying(100),
    ma_chuan_chi character varying(100),
    trang_thai integer DEFAULT 10 NOT NULL,
    noi_dung_loi character varying(1000),
    nguoi_khoi_tao_id integer NOT NULL,
    nguoi_xac_nhan_id integer,
    thoi_gian_thanh_toan timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    so_luong integer,
    thanh_toan_goc_id bigint,
    phieu_moi_id bigint,
    CONSTRAINT chk_nv_thanh_toan_ve_an_loai CHECK ((loai_giao_dich = ANY (ARRAY[10, 20]))),
    CONSTRAINT chk_nv_thanh_toan_ve_an_phuong_thuc CHECK ((phuong_thuc = ANY (ARRAY[10, 20, 30]))),
    CONSTRAINT chk_nv_thanh_toan_ve_an_so_tien CHECK ((so_tien >= (0)::numeric)),
    CONSTRAINT chk_nv_thanh_toan_ve_an_trang_thai CHECK ((trang_thai = ANY (ARRAY[10, 20, 30, 40, 50])))
);


--
-- Name: nv_thanh_toan_ve_an_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nv_thanh_toan_ve_an_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: nv_thanh_toan_ve_an_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nv_thanh_toan_ve_an_id_seq OWNED BY public.nv_thanh_toan_ve_an.id;


--
-- Name: nv_thong_bao; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nv_thong_bao (
    id integer NOT NULL,
    tieu_de character varying(255) NOT NULL,
    noi_dung text NOT NULL,
    gui_tat_ca boolean DEFAULT false NOT NULL,
    tu_dong boolean DEFAULT false NOT NULL,
    ma_su_kien character varying(100),
    loai_tham_chieu character varying(100),
    tham_chieu_id integer,
    duong_dan character varying(500),
    trang_thai smallint DEFAULT 10 NOT NULL,
    nguoi_tao_id integer,
    thoi_gian_gui timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_nv_thong_bao_trang_thai CHECK ((trang_thai = ANY (ARRAY[10, 20, 30])))
);


--
-- Name: nv_thong_bao_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nv_thong_bao_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: nv_thong_bao_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nv_thong_bao_id_seq OWNED BY public.nv_thong_bao.id;


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
-- Name: nv_voucher_don_hang_su_dung; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nv_voucher_don_hang_su_dung (
    id bigint NOT NULL,
    voucher_don_hang_id bigint NOT NULL,
    don_hang_id bigint NOT NULL,
    nhan_vien_id integer NOT NULL,
    so_tien_giam numeric(18,6) NOT NULL,
    trang_thai integer DEFAULT 10 NOT NULL,
    thoi_gian_giu timestamp without time zone DEFAULT now() NOT NULL,
    het_han_giu_luc timestamp without time zone,
    thoi_gian_su_dung timestamp without time zone,
    thoi_gian_hoan timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_nv_voucher_don_hang_su_dung_tien CHECK ((so_tien_giam >= (0)::numeric)),
    CONSTRAINT chk_nv_voucher_don_hang_su_dung_trang_thai CHECK ((trang_thai = ANY (ARRAY[10, 20, 30])))
);


--
-- Name: COLUMN nv_voucher_don_hang_su_dung.trang_thai; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.nv_voucher_don_hang_su_dung.trang_thai IS '10=Giu cho, 20=Da su dung, 30=Da hoan luot';


--
-- Name: nv_voucher_don_hang_su_dung_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.nv_voucher_don_hang_su_dung_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: nv_voucher_don_hang_su_dung_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.nv_voucher_don_hang_su_dung_id_seq OWNED BY public.nv_voucher_don_hang_su_dung.id;


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
-- Name: ct_binh_chon_suat_an id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_binh_chon_suat_an ALTER COLUMN id SET DEFAULT nextval('public.ct_binh_chon_suat_an_id_seq'::regclass);


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
-- Name: ct_don_hang id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_don_hang ALTER COLUMN id SET DEFAULT nextval('public.ct_don_hang_id_seq'::regclass);


--
-- Name: ct_don_hang_voucher id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_don_hang_voucher ALTER COLUMN id SET DEFAULT nextval('public.ct_don_hang_voucher_id_seq'::regclass);


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
-- Name: ct_phieu_lay_ve_mien_giam id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_phieu_lay_ve_mien_giam ALTER COLUMN id SET DEFAULT nextval('public.ct_phieu_lay_ve_mien_giam_id_seq'::regclass);


--
-- Name: ct_phieu_nhap id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_phieu_nhap ALTER COLUMN id SET DEFAULT nextval('public.ct_phieu_nhap_id_seq'::regclass);


--
-- Name: ct_phieu_xuat id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_phieu_xuat ALTER COLUMN id SET DEFAULT nextval('public.ct_phieu_xuat_id_seq'::regclass);


--
-- Name: ct_san_pham_co_so id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_san_pham_co_so ALTER COLUMN id SET DEFAULT nextval('public.ct_san_pham_co_so_id_seq'::regclass);


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
-- Name: ct_ve_an id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_ve_an ALTER COLUMN id SET DEFAULT nextval('public.ct_ve_an_id_seq'::regclass);


--
-- Name: ct_voucher_don_hang_nha_an id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_voucher_don_hang_nha_an ALTER COLUMN id SET DEFAULT nextval('public.ct_voucher_don_hang_nha_an_id_seq'::regclass);


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
-- Name: dm_dia_diem_nhan_hang id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_dia_diem_nhan_hang ALTER COLUMN id SET DEFAULT nextval('public.dm_dia_diem_nhan_hang_id_seq'::regclass);


--
-- Name: dm_don_vi_tinh id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_don_vi_tinh ALTER COLUMN id SET DEFAULT nextval('public.dm_don_vi_tinh_id_seq'::regclass);


--
-- Name: dm_gia_ve_an id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_gia_ve_an ALTER COLUMN id SET DEFAULT nextval('public.dm_gia_ve_an_id_seq'::regclass);


--
-- Name: dm_kho id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_kho ALTER COLUMN id SET DEFAULT nextval('public.dm_kho_id_seq'::regclass);


--
-- Name: dm_khung_gio_nhan_hang id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_khung_gio_nhan_hang ALTER COLUMN id SET DEFAULT nextval('public.dm_khung_gio_nhan_hang_id_seq'::regclass);


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
-- Name: dm_nhom_mon_an id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhom_mon_an ALTER COLUMN id SET DEFAULT nextval('public.dm_nhom_mon_an_id_seq'::regclass);


--
-- Name: dm_nhom_san_pham id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhom_san_pham ALTER COLUMN id SET DEFAULT nextval('public.dm_nhom_san_pham_id_seq'::regclass);


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
-- Name: dm_san_pham id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_san_pham ALTER COLUMN id SET DEFAULT nextval('public.dm_san_pham_id_seq'::regclass);


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
-- Name: dm_voucher_don_hang id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_voucher_don_hang ALTER COLUMN id SET DEFAULT nextval('public.dm_voucher_don_hang_id_seq'::regclass);


--
-- Name: dm_xa_phuong id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_xa_phuong ALTER COLUMN id SET DEFAULT nextval('public.dm_xa_phuong_id_seq'::regclass);


--
-- Name: nv_don_hang id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_don_hang ALTER COLUMN id SET DEFAULT nextval('public.nv_don_hang_id_seq'::regclass);


--
-- Name: nv_dot_binh_chon id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_dot_binh_chon ALTER COLUMN id SET DEFAULT nextval('public.nv_dot_binh_chon_id_seq'::regclass);


--
-- Name: nv_lich_su_don_hang id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_lich_su_don_hang ALTER COLUMN id SET DEFAULT nextval('public.nv_lich_su_don_hang_id_seq'::regclass);


--
-- Name: nv_phieu_lay_ve_an id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_phieu_lay_ve_an ALTER COLUMN id SET DEFAULT nextval('public.nv_phieu_lay_ve_an_id_seq'::regclass);


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
-- Name: nv_thanh_toan_don_hang id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thanh_toan_don_hang ALTER COLUMN id SET DEFAULT nextval('public.nv_thanh_toan_don_hang_id_seq'::regclass);


--
-- Name: nv_thanh_toan_ve_an id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thanh_toan_ve_an ALTER COLUMN id SET DEFAULT nextval('public.nv_thanh_toan_ve_an_id_seq'::regclass);


--
-- Name: nv_thong_bao id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thong_bao ALTER COLUMN id SET DEFAULT nextval('public.nv_thong_bao_id_seq'::regclass);


--
-- Name: nv_thuc_don id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thuc_don ALTER COLUMN id SET DEFAULT nextval('public.nv_thuc_don_id_seq'::regclass);


--
-- Name: nv_voucher_don_hang_su_dung id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_voucher_don_hang_su_dung ALTER COLUMN id SET DEFAULT nextval('public.nv_voucher_don_hang_su_dung_id_seq'::regclass);


--
-- Name: ton_kho id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ton_kho ALTER COLUMN id SET DEFAULT nextval('public.ton_kho_id_seq'::regclass);


--
-- Name: ct_binh_chon_suat_an ct_binh_chon_suat_an_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_binh_chon_suat_an
    ADD CONSTRAINT ct_binh_chon_suat_an_pkey PRIMARY KEY (id);


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
-- Name: ct_don_hang ct_don_hang_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_don_hang
    ADD CONSTRAINT ct_don_hang_pkey PRIMARY KEY (id);


--
-- Name: ct_don_hang_voucher ct_don_hang_voucher_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_don_hang_voucher
    ADD CONSTRAINT ct_don_hang_voucher_pkey PRIMARY KEY (id);


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
-- Name: ct_phieu_lay_ve_mien_giam ct_phieu_lay_ve_mien_giam_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_phieu_lay_ve_mien_giam
    ADD CONSTRAINT ct_phieu_lay_ve_mien_giam_pkey PRIMARY KEY (id);


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
-- Name: ct_san_pham_co_so ct_san_pham_co_so_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_san_pham_co_so
    ADD CONSTRAINT ct_san_pham_co_so_pkey PRIMARY KEY (id);


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
-- Name: ct_ve_an ct_ve_an_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_ve_an
    ADD CONSTRAINT ct_ve_an_pkey PRIMARY KEY (id);


--
-- Name: ct_voucher_don_hang_chuc_vu ct_voucher_don_hang_chuc_vu_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_voucher_don_hang_chuc_vu
    ADD CONSTRAINT ct_voucher_don_hang_chuc_vu_pkey PRIMARY KEY (voucher_don_hang_id, chuc_vu_id);


--
-- Name: ct_voucher_don_hang_co_so ct_voucher_don_hang_co_so_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_voucher_don_hang_co_so
    ADD CONSTRAINT ct_voucher_don_hang_co_so_pkey PRIMARY KEY (voucher_don_hang_id, co_so_id);


--
-- Name: ct_voucher_don_hang_nha_an ct_voucher_don_hang_nha_an_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_voucher_don_hang_nha_an
    ADD CONSTRAINT ct_voucher_don_hang_nha_an_pkey PRIMARY KEY (id);


--
-- Name: ct_voucher_don_hang_nhan_vien ct_voucher_don_hang_nhan_vien_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_voucher_don_hang_nhan_vien
    ADD CONSTRAINT ct_voucher_don_hang_nhan_vien_pkey PRIMARY KEY (voucher_don_hang_id, nhan_vien_id);


--
-- Name: ct_voucher_don_hang_nhom_san_pham ct_voucher_don_hang_nhom_san_pham_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_voucher_don_hang_nhom_san_pham
    ADD CONSTRAINT ct_voucher_don_hang_nhom_san_pham_pkey PRIMARY KEY (voucher_don_hang_id, nhom_san_pham_id);


--
-- Name: ct_voucher_don_hang_phong_ban ct_voucher_don_hang_phong_ban_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_voucher_don_hang_phong_ban
    ADD CONSTRAINT ct_voucher_don_hang_phong_ban_pkey PRIMARY KEY (voucher_don_hang_id, phong_ban_id);


--
-- Name: ct_voucher_don_hang_san_pham ct_voucher_don_hang_san_pham_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_voucher_don_hang_san_pham
    ADD CONSTRAINT ct_voucher_don_hang_san_pham_pkey PRIMARY KEY (voucher_don_hang_id, san_pham_id);


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
-- Name: dm_dia_diem_nhan_hang dm_dia_diem_nhan_hang_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_dia_diem_nhan_hang
    ADD CONSTRAINT dm_dia_diem_nhan_hang_pkey PRIMARY KEY (id);


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
-- Name: dm_gia_ve_an dm_gia_ve_an_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_gia_ve_an
    ADD CONSTRAINT dm_gia_ve_an_pkey PRIMARY KEY (id);


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
-- Name: dm_khung_gio_nhan_hang dm_khung_gio_nhan_hang_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_khung_gio_nhan_hang
    ADD CONSTRAINT dm_khung_gio_nhan_hang_pkey PRIMARY KEY (id);


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
-- Name: dm_nhom_san_pham dm_nhom_san_pham_ma_nhom_san_pham_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhom_san_pham
    ADD CONSTRAINT dm_nhom_san_pham_ma_nhom_san_pham_key UNIQUE (ma_nhom_san_pham);


--
-- Name: dm_nhom_san_pham dm_nhom_san_pham_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhom_san_pham
    ADD CONSTRAINT dm_nhom_san_pham_pkey PRIMARY KEY (id);


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
-- Name: dm_san_pham dm_san_pham_ma_san_pham_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_san_pham
    ADD CONSTRAINT dm_san_pham_ma_san_pham_key UNIQUE (ma_san_pham);


--
-- Name: dm_san_pham dm_san_pham_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_san_pham
    ADD CONSTRAINT dm_san_pham_pkey PRIMARY KEY (id);


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
-- Name: dm_voucher_don_hang dm_voucher_don_hang_ma_voucher_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_voucher_don_hang
    ADD CONSTRAINT dm_voucher_don_hang_ma_voucher_key UNIQUE (ma_voucher);


--
-- Name: dm_voucher_don_hang dm_voucher_don_hang_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_voucher_don_hang
    ADD CONSTRAINT dm_voucher_don_hang_pkey PRIMARY KEY (id);


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
-- Name: nv_don_hang nv_don_hang_ma_don_hang_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_don_hang
    ADD CONSTRAINT nv_don_hang_ma_don_hang_key UNIQUE (ma_don_hang);


--
-- Name: nv_don_hang nv_don_hang_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_don_hang
    ADD CONSTRAINT nv_don_hang_pkey PRIMARY KEY (id);


--
-- Name: nv_dot_binh_chon nv_dot_binh_chon_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_dot_binh_chon
    ADD CONSTRAINT nv_dot_binh_chon_pkey PRIMARY KEY (id);


--
-- Name: nv_lich_su_don_hang nv_lich_su_don_hang_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_lich_su_don_hang
    ADD CONSTRAINT nv_lich_su_don_hang_pkey PRIMARY KEY (id);


--
-- Name: nv_phieu_lay_ve_an nv_phieu_lay_ve_an_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_phieu_lay_ve_an
    ADD CONSTRAINT nv_phieu_lay_ve_an_pkey PRIMARY KEY (id);


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
-- Name: nv_thanh_toan_don_hang nv_thanh_toan_don_hang_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thanh_toan_don_hang
    ADD CONSTRAINT nv_thanh_toan_don_hang_pkey PRIMARY KEY (id);


--
-- Name: nv_thanh_toan_ve_an nv_thanh_toan_ve_an_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thanh_toan_ve_an
    ADD CONSTRAINT nv_thanh_toan_ve_an_pkey PRIMARY KEY (id);


--
-- Name: nv_thong_bao nv_thong_bao_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thong_bao
    ADD CONSTRAINT nv_thong_bao_pkey PRIMARY KEY (id);


--
-- Name: nv_thuc_don nv_thuc_don_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thuc_don
    ADD CONSTRAINT nv_thuc_don_pkey PRIMARY KEY (id);


--
-- Name: nv_voucher_don_hang_su_dung nv_voucher_don_hang_su_dung_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_voucher_don_hang_su_dung
    ADD CONSTRAINT nv_voucher_don_hang_su_dung_pkey PRIMARY KEY (id);


--
-- Name: ct_chinh_sach_voucher pk_ct_chinh_sach_voucher; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_chinh_sach_voucher
    ADD CONSTRAINT pk_ct_chinh_sach_voucher PRIMARY KEY (chinh_sach_id, voucher_id);


--
-- Name: ct_thong_bao_doi_tuong pk_ct_thong_bao_doi_tuong; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_thong_bao_doi_tuong
    ADD CONSTRAINT pk_ct_thong_bao_doi_tuong PRIMARY KEY (thong_bao_id, loai_doi_tuong, doi_tuong_id);


--
-- Name: ct_thong_bao_nguoi_nhan pk_ct_thong_bao_nguoi_nhan; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_thong_bao_nguoi_nhan
    ADD CONSTRAINT pk_ct_thong_bao_nguoi_nhan PRIMARY KEY (thong_bao_id, tai_khoan_id);


--
-- Name: ton_kho ton_kho_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ton_kho
    ADD CONSTRAINT ton_kho_pkey PRIMARY KEY (id);


--
-- Name: ct_binh_chon_suat_an uq_ct_binh_chon_suat_an; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_binh_chon_suat_an
    ADD CONSTRAINT uq_ct_binh_chon_suat_an UNIQUE (dot_binh_chon_id, tai_khoan_id);


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
-- Name: ct_don_hang_voucher uq_ct_don_hang_voucher; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_don_hang_voucher
    ADD CONSTRAINT uq_ct_don_hang_voucher UNIQUE (don_hang_id, voucher_don_hang_id);


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
-- Name: ct_phieu_lay_ve_mien_giam uq_ct_phieu_lay_ve_mien_giam_thu_tu; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_phieu_lay_ve_mien_giam
    ADD CONSTRAINT uq_ct_phieu_lay_ve_mien_giam_thu_tu UNIQUE (phieu_lay_ve_id, thu_tu_ap_dung);


--
-- Name: ct_san_pham_co_so uq_ct_san_pham_co_so; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_san_pham_co_so
    ADD CONSTRAINT uq_ct_san_pham_co_so UNIQUE (san_pham_id, co_so_id);


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
-- Name: ct_ve_an uq_ct_ve_an_ma_ve; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_ve_an
    ADD CONSTRAINT uq_ct_ve_an_ma_ve UNIQUE (ma_ve);


--
-- Name: ct_ve_an uq_ct_ve_an_phieu_thu_tu; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_ve_an
    ADD CONSTRAINT uq_ct_ve_an_phieu_thu_tu UNIQUE (phieu_lay_ve_id, so_thu_tu);


--
-- Name: ct_ve_an uq_ct_ve_an_qr_token; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_ve_an
    ADD CONSTRAINT uq_ct_ve_an_qr_token UNIQUE (qr_token);


--
-- Name: ct_voucher_don_hang_nha_an uq_ct_voucher_don_hang_nha_an; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_voucher_don_hang_nha_an
    ADD CONSTRAINT uq_ct_voucher_don_hang_nha_an UNIQUE (voucher_don_hang_id, nha_an_id);


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
-- Name: dm_dia_diem_nhan_hang uq_dm_dia_diem_nhan_hang; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_dia_diem_nhan_hang
    ADD CONSTRAINT uq_dm_dia_diem_nhan_hang UNIQUE (nhan_vien_id, ma_dia_diem);


--
-- Name: dm_khung_gio_nhan_hang uq_dm_khung_gio_nhan_hang; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_khung_gio_nhan_hang
    ADD CONSTRAINT uq_dm_khung_gio_nhan_hang UNIQUE (co_so_id, ma_khung_gio);


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
-- Name: nv_phieu_lay_ve_an uq_nv_phieu_lay_ve_an_so_phieu; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_phieu_lay_ve_an
    ADD CONSTRAINT uq_nv_phieu_lay_ve_an_so_phieu UNIQUE (so_phieu);


--
-- Name: nv_thuc_don uq_nv_thuc_don_ma; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thuc_don
    ADD CONSTRAINT uq_nv_thuc_don_ma UNIQUE (ma_thuc_don);


--
-- Name: nv_voucher_don_hang_su_dung uq_nv_voucher_don_hang_su_dung; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_voucher_don_hang_su_dung
    ADD CONSTRAINT uq_nv_voucher_don_hang_su_dung UNIQUE (voucher_don_hang_id, don_hang_id);


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
-- Name: idx_ct_binh_chon_suat_an_dot; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_binh_chon_suat_an_dot ON public.ct_binh_chon_suat_an USING btree (dot_binh_chon_id);


--
-- Name: idx_ct_binh_chon_suat_an_lua_chon; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_binh_chon_suat_an_lua_chon ON public.ct_binh_chon_suat_an USING btree (dot_binh_chon_id, lua_chon);


--
-- Name: idx_ct_binh_chon_suat_an_tai_khoan; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_binh_chon_suat_an_tai_khoan ON public.ct_binh_chon_suat_an USING btree (tai_khoan_id);


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
-- Name: idx_ct_don_hang_don_hang; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_don_hang_don_hang ON public.ct_don_hang USING btree (don_hang_id);


--
-- Name: idx_ct_knvql_kho; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_knvql_kho ON public.ct_kho_nhan_vien_quan_ly USING btree (kho_id);


--
-- Name: idx_ct_knvql_nhan_vien; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_knvql_nhan_vien ON public.ct_kho_nhan_vien_quan_ly USING btree (nhan_vien_id);


--
-- Name: idx_ct_san_pham_co_so_ban; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_san_pham_co_so_ban ON public.ct_san_pham_co_so USING btree (co_so_id, cho_phep_dat, active);


--
-- Name: idx_ct_thong_bao_doi_tuong_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_thong_bao_doi_tuong_lookup ON public.ct_thong_bao_doi_tuong USING btree (loai_doi_tuong, doi_tuong_id);


--
-- Name: idx_ct_thong_bao_nguoi_nhan_chua_doc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_thong_bao_nguoi_nhan_chua_doc ON public.ct_thong_bao_nguoi_nhan USING btree (tai_khoan_id) WHERE (da_doc = false);


--
-- Name: idx_ct_thong_bao_nguoi_nhan_tai_khoan; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_thong_bao_nguoi_nhan_tai_khoan ON public.ct_thong_bao_nguoi_nhan USING btree (tai_khoan_id);


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
-- Name: idx_ct_voucher_don_hang_nha_an_nha_an; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_voucher_don_hang_nha_an_nha_an ON public.ct_voucher_don_hang_nha_an USING btree (nha_an_id);


--
-- Name: idx_ct_voucher_don_hang_nha_an_voucher; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ct_voucher_don_hang_nha_an_voucher ON public.ct_voucher_don_hang_nha_an USING btree (voucher_don_hang_id);


--
-- Name: idx_dm_chinh_sach_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dm_chinh_sach_active ON public.dm_chinh_sach USING btree (active);


--
-- Name: idx_dm_chinh_sach_loai; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dm_chinh_sach_loai ON public.dm_chinh_sach USING btree (loai_chinh_sach);


--
-- Name: idx_dm_dia_diem_nhan_hang_nhan_vien; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dm_dia_diem_nhan_hang_nhan_vien ON public.dm_dia_diem_nhan_hang USING btree (nhan_vien_id, active, thu_tu_hien_thi);


--
-- Name: idx_dm_dia_diem_nhan_hang_nhan_vien_ap_dung; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dm_dia_diem_nhan_hang_nhan_vien_ap_dung ON public.dm_dia_diem_nhan_hang USING btree (nhan_vien_ap_dung_id);


--
-- Name: idx_dm_gia_ve_an_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dm_gia_ve_an_lookup ON public.dm_gia_ve_an USING btree (doi_tuong_lay_ve, co_so_id, nha_an_id, ca_an_id, tu_ngay, den_ngay) WHERE (active = true);


--
-- Name: idx_dm_san_pham_nhom_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dm_san_pham_nhom_active ON public.dm_san_pham USING btree (nhom_san_pham_id, active, thu_tu_hien_thi);


--
-- Name: idx_dm_thiet_lap_co_so_co_so_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dm_thiet_lap_co_so_co_so_id ON public.dm_thiet_lap_co_so USING btree (co_so_id);


--
-- Name: idx_dm_thiet_lap_co_so_thiet_lap_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dm_thiet_lap_co_so_thiet_lap_id ON public.dm_thiet_lap_co_so USING btree (thiet_lap_id);


--
-- Name: idx_nv_don_hang_co_so_trang_thai; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nv_don_hang_co_so_trang_thai ON public.nv_don_hang USING btree (co_so_id, trang_thai, created_at DESC);


--
-- Name: idx_nv_don_hang_nguoi_dat; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nv_don_hang_nguoi_dat ON public.nv_don_hang USING btree (nguoi_dat_id, created_at DESC);


--
-- Name: idx_nv_don_hang_nguoi_xu_ly; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nv_don_hang_nguoi_xu_ly ON public.nv_don_hang USING btree (nguoi_xu_ly_id, trang_thai);


--
-- Name: idx_nv_don_hang_thoi_gian_nhan; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nv_don_hang_thoi_gian_nhan ON public.nv_don_hang USING btree (thoi_gian_nhan_tu, thoi_gian_nhan_den);


--
-- Name: idx_nv_dot_binh_chon_bat_dau; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nv_dot_binh_chon_bat_dau ON public.nv_dot_binh_chon USING btree (bat_dau_binh_chon);


--
-- Name: idx_nv_dot_binh_chon_han; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nv_dot_binh_chon_han ON public.nv_dot_binh_chon USING btree (han_binh_chon);


--
-- Name: idx_nv_dot_binh_chon_thuc_don_ngay; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nv_dot_binh_chon_thuc_don_ngay ON public.nv_dot_binh_chon USING btree (thuc_don_ngay_id);


--
-- Name: idx_nv_lich_su_don_hang_don; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nv_lich_su_don_hang_don ON public.nv_lich_su_don_hang USING btree (don_hang_id, created_at);


--
-- Name: idx_nv_phieu_lay_ve_an_phieu_goc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nv_phieu_lay_ve_an_phieu_goc ON public.nv_phieu_lay_ve_an USING btree (phieu_goc_id);


--
-- Name: idx_nv_thanh_toan_don_hang_don; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nv_thanh_toan_don_hang_don ON public.nv_thanh_toan_don_hang USING btree (don_hang_id, created_at DESC);


--
-- Name: idx_nv_thanh_toan_ve_an_phieu_moi; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nv_thanh_toan_ve_an_phieu_moi ON public.nv_thanh_toan_ve_an USING btree (phieu_moi_id);


--
-- Name: idx_nv_thanh_toan_ve_an_thanh_toan_goc; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nv_thanh_toan_ve_an_thanh_toan_goc ON public.nv_thanh_toan_ve_an USING btree (thanh_toan_goc_id);


--
-- Name: idx_nv_thong_bao_thoi_gian_gui; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nv_thong_bao_thoi_gian_gui ON public.nv_thong_bao USING btree (thoi_gian_gui DESC);


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
-- Name: idx_nv_voucher_don_hang_nhan_vien; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nv_voucher_don_hang_nhan_vien ON public.nv_voucher_don_hang_su_dung USING btree (voucher_don_hang_id, nhan_vien_id, trang_thai);


--
-- Name: idx_quyen_nhom_nhom_tinh_nang_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quyen_nhom_nhom_tinh_nang_id ON public.dm_quyen_nhom_tinh_nang USING btree (nhom_tinh_nang_id);


--
-- Name: idx_quyen_nhom_quyen_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quyen_nhom_quyen_id ON public.dm_quyen_nhom_tinh_nang USING btree (quyen_id);


--
-- Name: uq_dm_dia_diem_nhan_hang_mac_dinh; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_dm_dia_diem_nhan_hang_mac_dinh ON public.dm_dia_diem_nhan_hang USING btree (nhan_vien_id) WHERE ((la_mac_dinh = true) AND (active = true));


--
-- Name: uq_dm_dia_diem_nhan_hang_ten; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_dm_dia_diem_nhan_hang_ten ON public.dm_dia_diem_nhan_hang USING btree (nhan_vien_id, lower(btrim((ten_dia_diem)::text)));


--
-- Name: uq_nv_dot_binh_chon_thuc_don_ngay_hieu_luc; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_nv_dot_binh_chon_thuc_don_ngay_hieu_luc ON public.nv_dot_binh_chon USING btree (thuc_don_ngay_id) WHERE (trang_thai <> 30);


--
-- Name: uq_nv_thanh_toan_don_hang_ma_giao_dich; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_nv_thanh_toan_don_hang_ma_giao_dich ON public.nv_thanh_toan_don_hang USING btree (ma_giao_dich) WHERE (ma_giao_dich IS NOT NULL);


--
-- Name: uq_nv_thanh_toan_ve_an_ma_giao_dich; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_nv_thanh_toan_ve_an_ma_giao_dich ON public.nv_thanh_toan_ve_an USING btree (ma_giao_dich) WHERE (ma_giao_dich IS NOT NULL);


--
-- Name: ct_phieu_lay_ve_mien_giam trg_ct_phieu_lay_ve_mien_giam_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_ct_phieu_lay_ve_mien_giam_updated_at BEFORE UPDATE ON public.ct_phieu_lay_ve_mien_giam FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ct_phieu_nhap trg_ct_phieu_nhap_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_ct_phieu_nhap_updated_at BEFORE UPDATE ON public.ct_phieu_nhap FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ct_phieu_xuat trg_ct_phieu_xuat_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_ct_phieu_xuat_updated_at BEFORE UPDATE ON public.ct_phieu_xuat FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ct_ve_an trg_ct_ve_an_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_ct_ve_an_updated_at BEFORE UPDATE ON public.ct_ve_an FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: dm_dia_diem_nhan_hang trg_dm_dia_diem_nhan_hang_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_dm_dia_diem_nhan_hang_updated_at BEFORE UPDATE ON public.dm_dia_diem_nhan_hang FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: dm_gia_ve_an trg_dm_gia_ve_an_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_dm_gia_ve_an_updated_at BEFORE UPDATE ON public.dm_gia_ve_an FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: dm_thiet_lap_co_so trg_dm_thiet_lap_co_so_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_dm_thiet_lap_co_so_updated_at BEFORE UPDATE ON public.dm_thiet_lap_co_so FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: dm_thiet_lap trg_dm_thiet_lap_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_dm_thiet_lap_updated_at BEFORE UPDATE ON public.dm_thiet_lap FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: nv_phieu_lay_ve_an trg_nv_phieu_lay_ve_an_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_nv_phieu_lay_ve_an_updated_at BEFORE UPDATE ON public.nv_phieu_lay_ve_an FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: nv_phieu_nhap trg_nv_phieu_nhap_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_nv_phieu_nhap_updated_at BEFORE UPDATE ON public.nv_phieu_nhap FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: nv_phieu_xuat trg_nv_phieu_xuat_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_nv_phieu_xuat_updated_at BEFORE UPDATE ON public.nv_phieu_xuat FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: nv_thanh_toan_ve_an trg_nv_thanh_toan_ve_an_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_nv_thanh_toan_ve_an_updated_at BEFORE UPDATE ON public.nv_thanh_toan_ve_an FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ton_kho trg_ton_kho_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_ton_kho_updated_at BEFORE UPDATE ON public.ton_kho FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ct_don_hang ct_don_hang_don_hang_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_don_hang
    ADD CONSTRAINT ct_don_hang_don_hang_id_fkey FOREIGN KEY (don_hang_id) REFERENCES public.nv_don_hang(id);


--
-- Name: ct_don_hang ct_don_hang_san_pham_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_don_hang
    ADD CONSTRAINT ct_don_hang_san_pham_id_fkey FOREIGN KEY (san_pham_id) REFERENCES public.dm_san_pham(id);


--
-- Name: ct_don_hang_voucher ct_don_hang_voucher_don_hang_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_don_hang_voucher
    ADD CONSTRAINT ct_don_hang_voucher_don_hang_id_fkey FOREIGN KEY (don_hang_id) REFERENCES public.nv_don_hang(id);


--
-- Name: ct_don_hang_voucher ct_don_hang_voucher_voucher_don_hang_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_don_hang_voucher
    ADD CONSTRAINT ct_don_hang_voucher_voucher_don_hang_id_fkey FOREIGN KEY (voucher_don_hang_id) REFERENCES public.dm_voucher_don_hang(id);


--
-- Name: ct_san_pham_co_so ct_san_pham_co_so_co_so_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_san_pham_co_so
    ADD CONSTRAINT ct_san_pham_co_so_co_so_id_fkey FOREIGN KEY (co_so_id) REFERENCES public.dm_co_so(id);


--
-- Name: ct_san_pham_co_so ct_san_pham_co_so_san_pham_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_san_pham_co_so
    ADD CONSTRAINT ct_san_pham_co_so_san_pham_id_fkey FOREIGN KEY (san_pham_id) REFERENCES public.dm_san_pham(id);


--
-- Name: ct_voucher_don_hang_chuc_vu ct_voucher_don_hang_chuc_vu_chuc_vu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_voucher_don_hang_chuc_vu
    ADD CONSTRAINT ct_voucher_don_hang_chuc_vu_chuc_vu_id_fkey FOREIGN KEY (chuc_vu_id) REFERENCES public.dm_chuc_vu(id);


--
-- Name: ct_voucher_don_hang_chuc_vu ct_voucher_don_hang_chuc_vu_voucher_don_hang_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_voucher_don_hang_chuc_vu
    ADD CONSTRAINT ct_voucher_don_hang_chuc_vu_voucher_don_hang_id_fkey FOREIGN KEY (voucher_don_hang_id) REFERENCES public.dm_voucher_don_hang(id) ON DELETE CASCADE;


--
-- Name: ct_voucher_don_hang_co_so ct_voucher_don_hang_co_so_co_so_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_voucher_don_hang_co_so
    ADD CONSTRAINT ct_voucher_don_hang_co_so_co_so_id_fkey FOREIGN KEY (co_so_id) REFERENCES public.dm_co_so(id);


--
-- Name: ct_voucher_don_hang_co_so ct_voucher_don_hang_co_so_voucher_don_hang_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_voucher_don_hang_co_so
    ADD CONSTRAINT ct_voucher_don_hang_co_so_voucher_don_hang_id_fkey FOREIGN KEY (voucher_don_hang_id) REFERENCES public.dm_voucher_don_hang(id) ON DELETE CASCADE;


--
-- Name: ct_voucher_don_hang_nha_an ct_voucher_don_hang_nha_an_nha_an_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_voucher_don_hang_nha_an
    ADD CONSTRAINT ct_voucher_don_hang_nha_an_nha_an_id_fkey FOREIGN KEY (nha_an_id) REFERENCES public.dm_nha_an(id) ON DELETE CASCADE;


--
-- Name: ct_voucher_don_hang_nha_an ct_voucher_don_hang_nha_an_voucher_don_hang_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_voucher_don_hang_nha_an
    ADD CONSTRAINT ct_voucher_don_hang_nha_an_voucher_don_hang_id_fkey FOREIGN KEY (voucher_don_hang_id) REFERENCES public.dm_voucher_don_hang(id) ON DELETE CASCADE;


--
-- Name: ct_voucher_don_hang_nhan_vien ct_voucher_don_hang_nhan_vien_nhan_vien_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_voucher_don_hang_nhan_vien
    ADD CONSTRAINT ct_voucher_don_hang_nhan_vien_nhan_vien_id_fkey FOREIGN KEY (nhan_vien_id) REFERENCES public.dm_nhan_vien(id);


--
-- Name: ct_voucher_don_hang_nhan_vien ct_voucher_don_hang_nhan_vien_voucher_don_hang_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_voucher_don_hang_nhan_vien
    ADD CONSTRAINT ct_voucher_don_hang_nhan_vien_voucher_don_hang_id_fkey FOREIGN KEY (voucher_don_hang_id) REFERENCES public.dm_voucher_don_hang(id) ON DELETE CASCADE;


--
-- Name: ct_voucher_don_hang_nhom_san_pham ct_voucher_don_hang_nhom_san_pham_nhom_san_pham_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_voucher_don_hang_nhom_san_pham
    ADD CONSTRAINT ct_voucher_don_hang_nhom_san_pham_nhom_san_pham_id_fkey FOREIGN KEY (nhom_san_pham_id) REFERENCES public.dm_nhom_san_pham(id);


--
-- Name: ct_voucher_don_hang_nhom_san_pham ct_voucher_don_hang_nhom_san_pham_voucher_don_hang_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_voucher_don_hang_nhom_san_pham
    ADD CONSTRAINT ct_voucher_don_hang_nhom_san_pham_voucher_don_hang_id_fkey FOREIGN KEY (voucher_don_hang_id) REFERENCES public.dm_voucher_don_hang(id) ON DELETE CASCADE;


--
-- Name: ct_voucher_don_hang_phong_ban ct_voucher_don_hang_phong_ban_phong_ban_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_voucher_don_hang_phong_ban
    ADD CONSTRAINT ct_voucher_don_hang_phong_ban_phong_ban_id_fkey FOREIGN KEY (phong_ban_id) REFERENCES public.dm_phong_ban(id);


--
-- Name: ct_voucher_don_hang_phong_ban ct_voucher_don_hang_phong_ban_voucher_don_hang_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_voucher_don_hang_phong_ban
    ADD CONSTRAINT ct_voucher_don_hang_phong_ban_voucher_don_hang_id_fkey FOREIGN KEY (voucher_don_hang_id) REFERENCES public.dm_voucher_don_hang(id) ON DELETE CASCADE;


--
-- Name: ct_voucher_don_hang_san_pham ct_voucher_don_hang_san_pham_san_pham_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_voucher_don_hang_san_pham
    ADD CONSTRAINT ct_voucher_don_hang_san_pham_san_pham_id_fkey FOREIGN KEY (san_pham_id) REFERENCES public.dm_san_pham(id);


--
-- Name: ct_voucher_don_hang_san_pham ct_voucher_don_hang_san_pham_voucher_don_hang_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_voucher_don_hang_san_pham
    ADD CONSTRAINT ct_voucher_don_hang_san_pham_voucher_don_hang_id_fkey FOREIGN KEY (voucher_don_hang_id) REFERENCES public.dm_voucher_don_hang(id) ON DELETE CASCADE;


--
-- Name: dm_khung_gio_nhan_hang dm_khung_gio_nhan_hang_co_so_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_khung_gio_nhan_hang
    ADD CONSTRAINT dm_khung_gio_nhan_hang_co_so_id_fkey FOREIGN KEY (co_so_id) REFERENCES public.dm_co_so(id);


--
-- Name: dm_san_pham dm_san_pham_don_vi_tinh_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_san_pham
    ADD CONSTRAINT dm_san_pham_don_vi_tinh_id_fkey FOREIGN KEY (don_vi_tinh_id) REFERENCES public.dm_don_vi_tinh(id);


--
-- Name: dm_san_pham dm_san_pham_nhom_san_pham_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_san_pham
    ADD CONSTRAINT dm_san_pham_nhom_san_pham_id_fkey FOREIGN KEY (nhom_san_pham_id) REFERENCES public.dm_nhom_san_pham(id);


--
-- Name: dm_voucher_don_hang dm_voucher_don_hang_nguoi_tao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_voucher_don_hang
    ADD CONSTRAINT dm_voucher_don_hang_nguoi_tao_id_fkey FOREIGN KEY (nguoi_tao_id) REFERENCES public.dm_nhan_vien(id);


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
-- Name: ct_binh_chon_suat_an fk_ct_binh_chon_suat_an_dot; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_binh_chon_suat_an
    ADD CONSTRAINT fk_ct_binh_chon_suat_an_dot FOREIGN KEY (dot_binh_chon_id) REFERENCES public.nv_dot_binh_chon(id) ON DELETE CASCADE;


--
-- Name: ct_binh_chon_suat_an fk_ct_binh_chon_suat_an_tai_khoan; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_binh_chon_suat_an
    ADD CONSTRAINT fk_ct_binh_chon_suat_an_tai_khoan FOREIGN KEY (tai_khoan_id) REFERENCES public.dm_tai_khoan(id) ON DELETE CASCADE;


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
-- Name: ct_phieu_lay_ve_mien_giam fk_ct_phieu_lay_ve_mien_giam_chinh_sach; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_phieu_lay_ve_mien_giam
    ADD CONSTRAINT fk_ct_phieu_lay_ve_mien_giam_chinh_sach FOREIGN KEY (chinh_sach_id) REFERENCES public.dm_chinh_sach(id);


--
-- Name: ct_phieu_lay_ve_mien_giam fk_ct_phieu_lay_ve_mien_giam_nguoi_ap; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_phieu_lay_ve_mien_giam
    ADD CONSTRAINT fk_ct_phieu_lay_ve_mien_giam_nguoi_ap FOREIGN KEY (nguoi_ap_mien_giam_id) REFERENCES public.dm_tai_khoan(id);


--
-- Name: ct_phieu_lay_ve_mien_giam fk_ct_phieu_lay_ve_mien_giam_nguoi_tao; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_phieu_lay_ve_mien_giam
    ADD CONSTRAINT fk_ct_phieu_lay_ve_mien_giam_nguoi_tao FOREIGN KEY (nguoi_tao_mien_giam_id) REFERENCES public.dm_tai_khoan(id);


--
-- Name: ct_phieu_lay_ve_mien_giam fk_ct_phieu_lay_ve_mien_giam_phieu; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_phieu_lay_ve_mien_giam
    ADD CONSTRAINT fk_ct_phieu_lay_ve_mien_giam_phieu FOREIGN KEY (phieu_lay_ve_id) REFERENCES public.nv_phieu_lay_ve_an(id) ON DELETE CASCADE;


--
-- Name: ct_phieu_lay_ve_mien_giam fk_ct_phieu_lay_ve_mien_giam_voucher; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_phieu_lay_ve_mien_giam
    ADD CONSTRAINT fk_ct_phieu_lay_ve_mien_giam_voucher FOREIGN KEY (voucher_id) REFERENCES public.dm_voucher(id);


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
-- Name: ct_thong_bao_doi_tuong fk_ct_thong_bao_doi_tuong_thong_bao; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_thong_bao_doi_tuong
    ADD CONSTRAINT fk_ct_thong_bao_doi_tuong_thong_bao FOREIGN KEY (thong_bao_id) REFERENCES public.nv_thong_bao(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ct_thong_bao_nguoi_nhan fk_ct_thong_bao_nguoi_nhan_tai_khoan; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_thong_bao_nguoi_nhan
    ADD CONSTRAINT fk_ct_thong_bao_nguoi_nhan_tai_khoan FOREIGN KEY (tai_khoan_id) REFERENCES public.dm_tai_khoan(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ct_thong_bao_nguoi_nhan fk_ct_thong_bao_nguoi_nhan_thong_bao; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_thong_bao_nguoi_nhan
    ADD CONSTRAINT fk_ct_thong_bao_nguoi_nhan_thong_bao FOREIGN KEY (thong_bao_id) REFERENCES public.nv_thong_bao(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: ct_ve_an fk_ct_ve_an_nguoi_huy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_ve_an
    ADD CONSTRAINT fk_ct_ve_an_nguoi_huy FOREIGN KEY (nguoi_huy_id) REFERENCES public.dm_tai_khoan(id);


--
-- Name: ct_ve_an fk_ct_ve_an_nguoi_xac_nhan; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_ve_an
    ADD CONSTRAINT fk_ct_ve_an_nguoi_xac_nhan FOREIGN KEY (nguoi_xac_nhan_id) REFERENCES public.dm_tai_khoan(id);


--
-- Name: ct_ve_an fk_ct_ve_an_phieu; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_ve_an
    ADD CONSTRAINT fk_ct_ve_an_phieu FOREIGN KEY (phieu_lay_ve_id) REFERENCES public.nv_phieu_lay_ve_an(id) ON DELETE CASCADE;


--
-- Name: ct_ve_an fk_ct_ve_an_thuc_don_ngay; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ct_ve_an
    ADD CONSTRAINT fk_ct_ve_an_thuc_don_ngay FOREIGN KEY (thuc_don_ngay_id) REFERENCES public.ct_thuc_don_ngay(id);


--
-- Name: dm_dia_diem_nhan_hang fk_dm_dia_diem_nhan_hang_nhan_vien; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_dia_diem_nhan_hang
    ADD CONSTRAINT fk_dm_dia_diem_nhan_hang_nhan_vien FOREIGN KEY (nhan_vien_id) REFERENCES public.dm_nhan_vien(id);


--
-- Name: dm_dia_diem_nhan_hang fk_dm_dia_diem_nhan_hang_nhan_vien_ap_dung; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_dia_diem_nhan_hang
    ADD CONSTRAINT fk_dm_dia_diem_nhan_hang_nhan_vien_ap_dung FOREIGN KEY (nhan_vien_ap_dung_id) REFERENCES public.dm_nhan_vien(id);


--
-- Name: dm_gia_ve_an fk_dm_gia_ve_an_ca_an; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_gia_ve_an
    ADD CONSTRAINT fk_dm_gia_ve_an_ca_an FOREIGN KEY (ca_an_id) REFERENCES public.dm_ca_an(id);


--
-- Name: dm_gia_ve_an fk_dm_gia_ve_an_co_so; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_gia_ve_an
    ADD CONSTRAINT fk_dm_gia_ve_an_co_so FOREIGN KEY (co_so_id) REFERENCES public.dm_co_so(id);


--
-- Name: dm_gia_ve_an fk_dm_gia_ve_an_nha_an; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_gia_ve_an
    ADD CONSTRAINT fk_dm_gia_ve_an_nha_an FOREIGN KEY (nha_an_id) REFERENCES public.dm_nha_an(id);


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
-- Name: dm_kho fk_kho_nha_an; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_kho
    ADD CONSTRAINT fk_kho_nha_an FOREIGN KEY (nha_an_id) REFERENCES public.dm_nha_an(id);


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
-- Name: nv_dot_binh_chon fk_nv_dot_binh_chon_nguoi_gui; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_dot_binh_chon
    ADD CONSTRAINT fk_nv_dot_binh_chon_nguoi_gui FOREIGN KEY (nguoi_gui_id) REFERENCES public.dm_tai_khoan(id) ON DELETE SET NULL;


--
-- Name: nv_dot_binh_chon fk_nv_dot_binh_chon_nguoi_huy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_dot_binh_chon
    ADD CONSTRAINT fk_nv_dot_binh_chon_nguoi_huy FOREIGN KEY (nguoi_huy_id) REFERENCES public.dm_tai_khoan(id) ON DELETE SET NULL;


--
-- Name: nv_dot_binh_chon fk_nv_dot_binh_chon_nguoi_tao; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_dot_binh_chon
    ADD CONSTRAINT fk_nv_dot_binh_chon_nguoi_tao FOREIGN KEY (nguoi_tao_id) REFERENCES public.dm_tai_khoan(id) ON DELETE SET NULL;


--
-- Name: nv_dot_binh_chon fk_nv_dot_binh_chon_thuc_don_ngay; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_dot_binh_chon
    ADD CONSTRAINT fk_nv_dot_binh_chon_thuc_don_ngay FOREIGN KEY (thuc_don_ngay_id) REFERENCES public.ct_thuc_don_ngay(id) ON DELETE CASCADE;


--
-- Name: nv_phieu_lay_ve_an fk_nv_phieu_lay_ve_an_nguoi_huy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_phieu_lay_ve_an
    ADD CONSTRAINT fk_nv_phieu_lay_ve_an_nguoi_huy FOREIGN KEY (nguoi_huy_id) REFERENCES public.dm_tai_khoan(id);


--
-- Name: nv_phieu_lay_ve_an fk_nv_phieu_lay_ve_an_nguoi_tao; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_phieu_lay_ve_an
    ADD CONSTRAINT fk_nv_phieu_lay_ve_an_nguoi_tao FOREIGN KEY (nguoi_tao_id) REFERENCES public.dm_tai_khoan(id);


--
-- Name: nv_phieu_lay_ve_an fk_nv_phieu_lay_ve_an_nguoi_thanh_toan; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_phieu_lay_ve_an
    ADD CONSTRAINT fk_nv_phieu_lay_ve_an_nguoi_thanh_toan FOREIGN KEY (nguoi_thanh_toan_id) REFERENCES public.dm_tai_khoan(id);


--
-- Name: nv_phieu_lay_ve_an fk_nv_phieu_lay_ve_an_nhan_vien; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_phieu_lay_ve_an
    ADD CONSTRAINT fk_nv_phieu_lay_ve_an_nhan_vien FOREIGN KEY (nhan_vien_id) REFERENCES public.dm_nhan_vien(id);


--
-- Name: nv_phieu_lay_ve_an fk_nv_phieu_lay_ve_an_phieu_goc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_phieu_lay_ve_an
    ADD CONSTRAINT fk_nv_phieu_lay_ve_an_phieu_goc FOREIGN KEY (phieu_goc_id) REFERENCES public.nv_phieu_lay_ve_an(id);


--
-- Name: nv_phieu_lay_ve_an fk_nv_phieu_lay_ve_an_thuc_don_ngay; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_phieu_lay_ve_an
    ADD CONSTRAINT fk_nv_phieu_lay_ve_an_thuc_don_ngay FOREIGN KEY (thuc_don_ngay_id) REFERENCES public.ct_thuc_don_ngay(id);


--
-- Name: dm_nhan_vien fk_nv_quoc_gia; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dm_nhan_vien
    ADD CONSTRAINT fk_nv_quoc_gia FOREIGN KEY (quoc_gia_id) REFERENCES public.dm_quoc_gia(id);


--
-- Name: nv_thanh_toan_ve_an fk_nv_thanh_toan_ve_an_nguoi_khoi_tao; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thanh_toan_ve_an
    ADD CONSTRAINT fk_nv_thanh_toan_ve_an_nguoi_khoi_tao FOREIGN KEY (nguoi_khoi_tao_id) REFERENCES public.dm_tai_khoan(id);


--
-- Name: nv_thanh_toan_ve_an fk_nv_thanh_toan_ve_an_nguoi_xac_nhan; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thanh_toan_ve_an
    ADD CONSTRAINT fk_nv_thanh_toan_ve_an_nguoi_xac_nhan FOREIGN KEY (nguoi_xac_nhan_id) REFERENCES public.dm_tai_khoan(id);


--
-- Name: nv_thanh_toan_ve_an fk_nv_thanh_toan_ve_an_phieu; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thanh_toan_ve_an
    ADD CONSTRAINT fk_nv_thanh_toan_ve_an_phieu FOREIGN KEY (phieu_lay_ve_id) REFERENCES public.nv_phieu_lay_ve_an(id);


--
-- Name: nv_thanh_toan_ve_an fk_nv_thanh_toan_ve_an_phieu_moi; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thanh_toan_ve_an
    ADD CONSTRAINT fk_nv_thanh_toan_ve_an_phieu_moi FOREIGN KEY (phieu_moi_id) REFERENCES public.nv_phieu_lay_ve_an(id);


--
-- Name: nv_thanh_toan_ve_an fk_nv_thanh_toan_ve_an_thanh_toan_goc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thanh_toan_ve_an
    ADD CONSTRAINT fk_nv_thanh_toan_ve_an_thanh_toan_goc FOREIGN KEY (thanh_toan_goc_id) REFERENCES public.nv_thanh_toan_ve_an(id);


--
-- Name: nv_thong_bao fk_nv_thong_bao_nguoi_tao; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thong_bao
    ADD CONSTRAINT fk_nv_thong_bao_nguoi_tao FOREIGN KEY (nguoi_tao_id) REFERENCES public.dm_tai_khoan(id) ON UPDATE CASCADE ON DELETE SET NULL;


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
-- Name: nv_don_hang nv_don_hang_co_so_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_don_hang
    ADD CONSTRAINT nv_don_hang_co_so_id_fkey FOREIGN KEY (co_so_id) REFERENCES public.dm_co_so(id);


--
-- Name: nv_don_hang nv_don_hang_dia_diem_nhan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_don_hang
    ADD CONSTRAINT nv_don_hang_dia_diem_nhan_id_fkey FOREIGN KEY (dia_diem_nhan_id) REFERENCES public.dm_dia_diem_nhan_hang(id);


--
-- Name: nv_don_hang nv_don_hang_khung_gio_nhan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_don_hang
    ADD CONSTRAINT nv_don_hang_khung_gio_nhan_id_fkey FOREIGN KEY (khung_gio_nhan_id) REFERENCES public.dm_khung_gio_nhan_hang(id);


--
-- Name: nv_don_hang nv_don_hang_nguoi_dat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_don_hang
    ADD CONSTRAINT nv_don_hang_nguoi_dat_id_fkey FOREIGN KEY (nguoi_dat_id) REFERENCES public.dm_nhan_vien(id);


--
-- Name: nv_don_hang nv_don_hang_nguoi_huy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_don_hang
    ADD CONSTRAINT nv_don_hang_nguoi_huy_id_fkey FOREIGN KEY (nguoi_huy_id) REFERENCES public.dm_nhan_vien(id);


--
-- Name: nv_don_hang nv_don_hang_nguoi_nhan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_don_hang
    ADD CONSTRAINT nv_don_hang_nguoi_nhan_id_fkey FOREIGN KEY (nguoi_nhan_id) REFERENCES public.dm_nhan_vien(id);


--
-- Name: nv_don_hang nv_don_hang_nguoi_xu_ly_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_don_hang
    ADD CONSTRAINT nv_don_hang_nguoi_xu_ly_id_fkey FOREIGN KEY (nguoi_xu_ly_id) REFERENCES public.dm_nhan_vien(id);


--
-- Name: nv_don_hang nv_don_hang_phong_ban_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_don_hang
    ADD CONSTRAINT nv_don_hang_phong_ban_id_fkey FOREIGN KEY (phong_ban_id) REFERENCES public.dm_phong_ban(id);


--
-- Name: nv_lich_su_don_hang nv_lich_su_don_hang_don_hang_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_lich_su_don_hang
    ADD CONSTRAINT nv_lich_su_don_hang_don_hang_id_fkey FOREIGN KEY (don_hang_id) REFERENCES public.nv_don_hang(id);


--
-- Name: nv_lich_su_don_hang nv_lich_su_don_hang_nguoi_thuc_hien_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_lich_su_don_hang
    ADD CONSTRAINT nv_lich_su_don_hang_nguoi_thuc_hien_id_fkey FOREIGN KEY (nguoi_thuc_hien_id) REFERENCES public.dm_nhan_vien(id);


--
-- Name: nv_thanh_toan_don_hang nv_thanh_toan_don_hang_don_hang_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thanh_toan_don_hang
    ADD CONSTRAINT nv_thanh_toan_don_hang_don_hang_id_fkey FOREIGN KEY (don_hang_id) REFERENCES public.nv_don_hang(id);


--
-- Name: nv_thanh_toan_don_hang nv_thanh_toan_don_hang_nguoi_khoi_tao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thanh_toan_don_hang
    ADD CONSTRAINT nv_thanh_toan_don_hang_nguoi_khoi_tao_id_fkey FOREIGN KEY (nguoi_khoi_tao_id) REFERENCES public.dm_nhan_vien(id);


--
-- Name: nv_thanh_toan_don_hang nv_thanh_toan_don_hang_nguoi_xac_nhan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thanh_toan_don_hang
    ADD CONSTRAINT nv_thanh_toan_don_hang_nguoi_xac_nhan_id_fkey FOREIGN KEY (nguoi_xac_nhan_id) REFERENCES public.dm_nhan_vien(id);


--
-- Name: nv_thanh_toan_don_hang nv_thanh_toan_don_hang_thanh_toan_goc_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_thanh_toan_don_hang
    ADD CONSTRAINT nv_thanh_toan_don_hang_thanh_toan_goc_id_fkey FOREIGN KEY (thanh_toan_goc_id) REFERENCES public.nv_thanh_toan_don_hang(id);


--
-- Name: nv_voucher_don_hang_su_dung nv_voucher_don_hang_su_dung_don_hang_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_voucher_don_hang_su_dung
    ADD CONSTRAINT nv_voucher_don_hang_su_dung_don_hang_id_fkey FOREIGN KEY (don_hang_id) REFERENCES public.nv_don_hang(id);


--
-- Name: nv_voucher_don_hang_su_dung nv_voucher_don_hang_su_dung_nhan_vien_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_voucher_don_hang_su_dung
    ADD CONSTRAINT nv_voucher_don_hang_su_dung_nhan_vien_id_fkey FOREIGN KEY (nhan_vien_id) REFERENCES public.dm_nhan_vien(id);


--
-- Name: nv_voucher_don_hang_su_dung nv_voucher_don_hang_su_dung_voucher_don_hang_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nv_voucher_don_hang_su_dung
    ADD CONSTRAINT nv_voucher_don_hang_su_dung_voucher_don_hang_id_fkey FOREIGN KEY (voucher_don_hang_id) REFERENCES public.dm_voucher_don_hang(id);


--
-- PostgreSQL database dump complete
--

\unrestrict J204Ujflee9jWkyBe0GrrzblDOUSGEmHttWTXMz9YObYhhwCqazZOsAVnRqVtdf

