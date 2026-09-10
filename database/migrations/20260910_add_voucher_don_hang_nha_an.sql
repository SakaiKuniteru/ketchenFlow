-- Liên kết voucher đơn hàng với một hoặc nhiều nhà ăn.
-- Chạy một lần trên database kitchenflow trước khi lưu voucher có chọn nhà ăn.

CREATE TABLE IF NOT EXISTS ct_voucher_don_hang_nha_an (
    id BIGSERIAL PRIMARY KEY,
    voucher_don_hang_id BIGINT NOT NULL
        REFERENCES dm_voucher_don_hang(id)
        ON DELETE CASCADE,
    nha_an_id INTEGER NOT NULL
        REFERENCES dm_nha_an(id)
        ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_ct_voucher_don_hang_nha_an
        UNIQUE (voucher_don_hang_id, nha_an_id)
);

CREATE INDEX IF NOT EXISTS idx_ct_voucher_don_hang_nha_an_voucher
    ON ct_voucher_don_hang_nha_an(voucher_don_hang_id);

CREATE INDEX IF NOT EXISTS idx_ct_voucher_don_hang_nha_an_nha_an
    ON ct_voucher_don_hang_nha_an(nha_an_id);
