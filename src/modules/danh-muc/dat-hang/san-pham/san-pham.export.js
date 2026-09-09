"use strict";

const {
    createExportFile
} = require(
    "../../../../helpers/excel/excel-export"
);

const sanPhamRepository =
    require(
        "./san-pham.repository"
    );


const MA_BAO_CAO =
    "dm_san_pham";

const HEADER_ROW =
    3;

const TEMPLATE_ROW =
    5;

const DATA_START_ROW =
    5;


function mapExportItem(
    item
) {

    return {

        id:
            item.id,

        maSanPham:
            item.maSanPham,

        tenSanPham:
            item.tenSanPham,

        nhomSanPhamId:
            item.nhomSanPhamId,

        tenNhomSanPham:
            item.tenNhomSanPham,

        loaiSanPham:
            item.loaiSanPham,

        donViTinhId:
            item.donViTinhId,

        tenDonViTinh:
            item.tenDonViTinh,

        giaBan:
            item.giaBan,

        moTa:
            item.moTa,

        hinhAnh:
            item.hinhAnh,

        choPhepDat:
            item.choPhepDat,

        laSanPhamMoi:
            item.laSanPhamMoi,

        laSanPhamNoiBat:
            item.laSanPhamNoiBat,

        soLuongToiThieu:
            item.soLuongToiThieu,

        soLuongToiDa:
            item.soLuongToiDa,

        buocSoLuong:
            item.buocSoLuong,

        thoiGianChuanBiPhut:
            item.thoiGianChuanBiPhut,

        thuTuHienThi:
            item.thuTuHienThi,

        active:
            item.active

    };

}


async function exportSanPham(
    query = {}
) {

    const danhSach =
        await sanPhamRepository
            .getTongHop(
                query
            );

    return createExportFile({

        maBaoCao:
            MA_BAO_CAO,

        headerRowNumber:
            HEADER_ROW,

        templateRowNumber:
            TEMPLATE_ROW,

        dataStartRowNumber:
            DATA_START_ROW,

        data:
            danhSach.map(
                mapExportItem
            )

    });

}


module.exports = {

    MA_BAO_CAO,

    HEADER_ROW,

    TEMPLATE_ROW,

    DATA_START_ROW,

    exportSanPham

};