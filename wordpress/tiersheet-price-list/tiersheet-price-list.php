<?php
/**
 * Plugin Name: TierSheet Price List
 * Description: Create a complete PDF, CSV or HTML price list from a product CSV in your browser.
 * Version: 0.1.0
 * Requires at least: 6.6
 * Requires PHP: 7.4
 * Author: TierSheet Project
 * License: GPL-2.0-or-later
 * Text Domain: tiersheet-price-list
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }
function tiersheet_price_list_menu() {
    add_management_page(
        __( 'TierSheet Price List', 'tiersheet-price-list' ),
        __( 'TierSheet Price List', 'tiersheet-price-list' ),
        'manage_options',
        'tiersheet-price-list',
        'tiersheet_price_list_page'
    );
}
add_action( 'admin_menu', 'tiersheet_price_list_menu' );
function tiersheet_price_list_page() {
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( esc_html__( 'You do not have permission to use this page.', 'tiersheet-price-list' ) );
    }
    $url = plugins_url( 'free.html', __FILE__ );
    echo '<div class="wrap"><h1>' . esc_html__( 'TierSheet Price List', 'tiersheet-price-list' ) . '</h1>';
    echo '<p>' . esc_html__( 'Files are processed in your browser. No store data is read or changed.', 'tiersheet-price-list' ) . '</p>';
    echo '<iframe title="' . esc_attr__( 'TierSheet free price list tool', 'tiersheet-price-list' ) . '" src="' . esc_url( $url ) . '" sandbox="allow-scripts allow-downloads" referrerpolicy="no-referrer" style="width:100%;height:1100px;border:1px solid #dfe5da;border-radius:12px"></iframe>';
    echo '</div>';
}
